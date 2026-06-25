import { useCallback, useEffect, useRef, useState } from "react";
import { DOMAIN } from "../constants";

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

    try {
      const res = await fetch(`${DOMAIN}/api/v1/general-ai/command`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.audioUrl) {
        try {
          audioRef.current = new Audio(`${DOMAIN}/${json.audioUrl}`);
          audioRef.current.play().catch(() => {});
        } catch (e) {
          /* autoplay blocked — ignore */
        }
      }
      if (json.command && typeof cfg.onCommand === "function") {
        cfg.onCommand(json.command);
      }
    } catch (e) {
      setError("network");
    } finally {
      setPhase("idle");
    }
  }, [setPhase]);

  const startRecording = useCallback(async () => {
    if (stateRef.current !== "idle") return;
    setError(null);

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
  }, [setPhase, releaseStream, sendBlob]);

  const stopRecording = useCallback(() => {
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
      releaseStream();
    },
    [releaseStream]
  );

  return { state, error, startRecording, stopRecording };
}
