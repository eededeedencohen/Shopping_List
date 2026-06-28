import { useCallback, useEffect, useRef, useState } from "react";
import { DOMAIN } from "../constants";

/* Conversation history is OWNED BY THE SERVER (a single JSON file). This hook
   only DRIVES it: after a command resolves it tells the server to clear the file
   (command succeeded → performCommand returns { history: "clear" }) or append
   the turn (show_cheapest → { history: "append", summary }). A failed/not-
   understood command ({ history: "keep" }) leaves the file untouched so the
   context survives a retry. The server reads that file for GPT context and
   applies its own inactivity (staleness) reset. */

/**
 * Voice-command recorder for the bottom-nav robot coin (long-press to record).
 *
 * Phases: "idle" → "starting" → "recording" → "processing" → "idle".
 *   - "starting"   — awaiting mic permission / MediaRecorder spin-up.
 *   - "recording"  — capturing audio (until the user taps the coin again).
 *   - "processing" — uploaded; waiting for STT → AI → TTS.
 *
 * Recording does NOT stop on finger release — it continues until stopRecording()
 * (the next tap). Navigation is delegated to the caller via onCommand so the
 * hook never holds stale router/state closures.
 *
 * @param {object} opts
 * @param {Array}      opts.pages          [{ index, label, route }]
 * @param {string[]}   opts.categories
 * @param {string[][]} opts.subCategories
 * @param {string}     opts.ttsLanguage    "he" | "en"
 * @param {string}     opts.ttsVoice
 * @param {(cmd:object)=>void} opts.onCommand
 */
export default function useVoiceCommand({
  pages,
  categories,
  subCategories,
  ttsLanguage,
  ttsVoice,
  onCommand,
}) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  const stateRef = useRef("idle");
  const setPhase = useCallback((p) => {
    stateRef.current = p;
    setState(p);
  }, []);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const pendingStopRef = useRef(false); // a stop requested during "starting"

  // latest config/handler (avoid stale closures inside async callbacks)
  const cfgRef = useRef({});
  cfgRef.current = {
    pages,
    categories,
    subCategories,
    ttsLanguage,
    ttsVoice,
    onCommand,
  };

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  /* Persist the conversation outcome to the server-owned history file. */
  const persistHistory = useCallback((body) => {
    return fetch(`${DOMAIN}/api/v1/general-ai/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, []);

  /* Explicit "reset the conversation" action (also exposed to the caller). */
  const clearHistory = useCallback(
    () => persistHistory({ action: "clear" }),
    [persistHistory]
  );

  const sendBlob = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    const mime = (recorder && recorder.mimeType) || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mime });
    chunksRef.current = [];

    if (!blob.size) {
      setPhase("idle");
      return;
    }

    const ext = mime.includes("mp4")
      ? "mp4"
      : mime.includes("ogg")
      ? "ogg"
      : "webm";

    const cfg = cfgRef.current;
    const fd = new FormData();
    fd.append("file", new File([blob], `voice.${ext}`, { type: mime }));
    fd.append(
      "context",
      JSON.stringify({
        pages: cfg.pages || [],
        categories: cfg.categories || [],
        subCategories: cfg.subCategories || [],
      })
    );
    fd.append("ttsLanguage", cfg.ttsLanguage || "he");
    if (cfg.ttsVoice) fd.append("ttsVoice", cfg.ttsVoice);
    // History is NOT sent — the server reads it from its own JSON file.

    try {
      const res = await fetch(`${DOMAIN}/api/v1/general-ai/command`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.audioUrl) {
        try {
          // stop any reply still playing from a previous turn (no overlap)
          if (audioRef.current) {
            try {
              audioRef.current.pause();
            } catch (e) {
              /* ignore */
            }
          }
          audioRef.current = new Audio(`${DOMAIN}/${json.audioUrl}`);
          audioRef.current.play().catch(() => {});
        } catch (e) {
          /* autoplay blocked — ignore */
        }
      }

      // Execute the action. performCommand returns a directive for the history
      // JSON: "clear" (command succeeded), "append" (show_cheapest → record the
      // list), or "keep" (failed / not understood → leave context for a retry).
      let directive = { history: "keep" };
      if (json.command && typeof cfg.onCommand === "function") {
        try {
          const r = await cfg.onCommand(json.command, json.transcript);
          if (r && r.history) directive = r;
        } catch (e) {
          /* ignore handler errors */
        }
      }

      // Persist the outcome to the server-owned history file.
      const transcript = (json.transcript || "").trim();
      if (directive.history === "clear") {
        await persistHistory({ action: "clear" });
      } else if (directive.history === "append" && transcript) {
        const assistantContent =
          (directive.summary && String(directive.summary)) ||
          (json.command && json.command.speech) ||
          "";
        await persistHistory({
          action: "append",
          user: transcript,
          assistant: assistantContent,
        });
      }
      // "keep" → leave the file unchanged
    } catch (e) {
      setError("network");
    } finally {
      setPhase("idle");
    }
  }, [setPhase, persistHistory]);

  const startRecording = useCallback(async () => {
    if (stateRef.current !== "idle") return;
    setError(null);
    pendingStopRef.current = false;

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("unsupported");
      return;
    }

    setPhase("starting");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError("mic-denied");
      setPhase("idle");
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];

    let mimeType = "";
    const prefs = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg",
    ];
    for (const m of prefs) {
      if (
        window.MediaRecorder.isTypeSupported &&
        window.MediaRecorder.isTypeSupported(m)
      ) {
        mimeType = m;
        break;
      }
    }

    let recorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (e) {
      releaseStream();
      setError("unsupported");
      setPhase("idle");
      return;
    }

    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      releaseStream();
      sendBlob();
    };
    recorder.start();
    setPhase("recording");

    // If the user already tapped to stop while mic permission was resolving,
    // honor it now (the UI promised tap-to-stop during "starting").
    if (pendingStopRef.current) {
      pendingStopRef.current = false;
      setPhase("processing");
      try {
        recorder.stop();
      } catch (e) {
        releaseStream();
        setPhase("idle");
      }
    }
  }, [setPhase, releaseStream, sendBlob]);

  const stopRecording = useCallback(() => {
    // Tap during "starting" (mic spin-up): remember it; startRecording stops
    // the recorder the moment it actually starts.
    if (stateRef.current === "starting") {
      pendingStopRef.current = true;
      return;
    }
    if (stateRef.current !== "recording") return;
    setPhase("processing");
    try {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    } catch (e) {
      releaseStream();
      setPhase("idle");
    }
  }, [setPhase, releaseStream]);

  // auto-clear transient errors so the hint chip doesn't linger
  useEffect(() => {
    if (!error) return undefined;
    const t = setTimeout(() => setError(null), 3500);
    return () => clearTimeout(t);
  }, [error]);

  // cleanup on unmount
  useEffect(
    () => () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        /* ignore */
      }
      try {
        if (audioRef.current) audioRef.current.pause();
      } catch (e) {
        /* ignore */
      }
      releaseStream();
    },
    [releaseStream]
  );

  return { state, error, startRecording, stopRecording, clearHistory };
}
