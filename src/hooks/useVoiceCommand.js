import { useCallback, useEffect, useRef, useState } from "react";
import { DOMAIN } from "../constants";

/* Conversation history is OWNED BY THE SERVER (a single JSON file). This hook
   only DRIVES it: after a command resolves it tells the server to clear the file
   (command succeeded → performCommand returns { history: "clear" }) or append
   the turn (show_cheapest → { history: "append", summary }). A failed/not-
   understood command ({ history: "keep" }) leaves the file untouched so the
   context survives a retry. The server reads that file for GPT context and
   applies its own inactivity (staleness) reset. */

/* ── Audio-engine tuning ─────────────────────────────────────────
   The wave UI reads a smoothed 0..1 `level` (mic RMS while you speak, TTS RMS
   while the AI speaks). Hands-free uses the SAME RMS (raw 0..127 units, like the
   AI page) against `micThreshold` for voice-activity detection. */
const QUIET_RMS = 1.5; // RMS at/below this counts as silence
const SILENCE_MS = 1000; // continuous silence that ends a hands-free utterance
const LEVEL_DIVISOR = 38; // RMS → 0..1 normalization for the waves
const LEVEL_SMOOTH = 0.4; // wave smoothing (higher = snappier)

/**
 * Voice engine for the bottom-nav robot coin.
 *
 *  • Long-press (single-shot): "idle" → "starting" → "recording" → "processing".
 *  • Hands-free (continuous):  double-tap opens the mic; a VAD loop records each
 *    utterance, auto-sends on silence, plays the reply, then resumes listening.
 *    A single tap exits. Multi-turn context survives via the server history file.
 *  • `level` (a ref, 0..1) + `mode` drive the audio-reactive wave animation in
 *    BOTH modes: mode ∈ "idle"|"listening"|"recording"|"processing"|"speaking".
 *
 * The AI page is NOT touched — this only reuses the /general-ai endpoints.
 *
 * @param {object} opts
 * @param {Array}      opts.pages          [{ index, label, route }]
 * @param {string[]}   opts.categories
 * @param {string[][]} opts.subCategories
 * @param {string}     opts.ttsLanguage    "he" | "en"
 * @param {string}     opts.ttsVoice
 * @param {number}     opts.micThreshold    VAD RMS threshold (hands-free)
 * @param {(cmd:object, transcript:string)=>void} opts.onCommand
 */
export default function useVoiceCommand({
  pages,
  categories,
  subCategories,
  ttsLanguage,
  ttsVoice,
  micThreshold,
  onCommand,
}) {
  const [state, setState] = useState("idle"); // single-shot phase
  const [error, setError] = useState(null);
  const [handsFree, setHandsFree] = useState(false);
  const [mode, setMode] = useState("idle"); // drives waves + hint

  const stateRef = useRef("idle");
  const setPhase = useCallback((p) => {
    stateRef.current = p;
    setState(p);
  }, []);

  // recording / stream
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const pendingStopRef = useRef(false); // a stop requested during "starting"

  // hands-free + shared flags
  const handsFreeRef = useRef(false);
  const speakingRef = useRef(false); // AI TTS currently playing
  const busyRef = useRef(false); // hands-free upload in flight
  const segActiveRef = useRef(false); // a hands-free utterance is being captured
  const quietSinceRef = useRef(null);

  // web-audio analysis
  const audioCtxRef = useRef(null);
  const micSrcRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const micRafRef = useRef(null);
  const ttsAudioRef = useRef(null);
  const ttsSrcRef = useRef(null);
  const ttsAnalyserRef = useRef(null);
  const ttsRafRef = useRef(null);

  // wave level (0..1) + current visual mode (read by VoiceWaves via the ref)
  const levelRef = useRef(0);
  const modeRef = useRef("idle");

  // latest config/handler (avoid stale closures inside async callbacks)
  const cfgRef = useRef({});
  cfgRef.current = {
    pages,
    categories,
    subCategories,
    ttsLanguage,
    ttsVoice,
    micThreshold,
    onCommand,
  };

  const refreshMode = useCallback(() => {
    let m;
    if (speakingRef.current) m = "speaking";
    else if (segActiveRef.current || stateRef.current === "recording")
      m = "recording";
    else if (busyRef.current || stateRef.current === "processing")
      m = "processing";
    else if (handsFreeRef.current) m = "listening";
    else m = "idle";
    if (m !== modeRef.current) {
      modeRef.current = m;
      setMode(m);
    }
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        audioCtxRef.current = new AC();
      } catch (e) {
        return null;
      }
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const rms = (analyser, buf) => {
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const d = buf[i] - 128;
      sum += d * d;
    }
    return Math.sqrt(sum / buf.length) || 0;
  };

  const pushLevel = (value) => {
    const target = Math.min(value / LEVEL_DIVISOR, 1);
    levelRef.current += (target - levelRef.current) * LEVEL_SMOOTH;
  };

  /* Persist the conversation outcome to the server-owned history file. */
  const persistHistory = useCallback((body) => {
    return fetch(`${DOMAIN}/api/v1/general-ai/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, []);

  const pickMime = () => {
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
        return m;
      }
    }
    return "";
  };

  /* ── TTS playback routed through an analyser (drives the speaking waves) ── */
  const stopReply = useCallback(() => {
    if (ttsRafRef.current) {
      cancelAnimationFrame(ttsRafRef.current);
      ttsRafRef.current = null;
    }
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
      } catch (e) {
        /* ignore */
      }
    }
    try {
      ttsSrcRef.current && ttsSrcRef.current.disconnect();
    } catch (e) {
      /* ignore */
    }
    try {
      ttsAnalyserRef.current && ttsAnalyserRef.current.disconnect();
    } catch (e) {
      /* ignore */
    }
    ttsSrcRef.current = null;
    ttsAnalyserRef.current = null;
    speakingRef.current = false;
  }, []);

  const playReply = useCallback(
    async (url) => {
      stopReply(); // never overlap a previous reply
      let audio;
      try {
        audio = new Audio(url);
        audio.crossOrigin = "anonymous";
      } catch (e) {
        return;
      }
      ttsAudioRef.current = audio;

      let analyser = null;
      let buf = null;
      const ctx = ensureCtx();
      if (ctx) {
        try {
          const src = ctx.createMediaElementSource(audio);
          analyser = ctx.createAnalyser();
          analyser.fftSize = 2048;
          src.connect(analyser);
          analyser.connect(ctx.destination); // else audio is silent
          buf = new Uint8Array(analyser.frequencyBinCount);
          ttsSrcRef.current = src;
          ttsAnalyserRef.current = analyser;
        } catch (e) {
          analyser = null; // analysis unavailable → element still plays
        }
      }

      const endSpeaking = () => {
        speakingRef.current = false;
        levelRef.current = 0;
        if (ttsRafRef.current) {
          cancelAnimationFrame(ttsRafRef.current);
          ttsRafRef.current = null;
        }
        refreshMode();
      };

      audio.addEventListener("play", () => {
        speakingRef.current = true;
        refreshMode();
        if (analyser && buf) {
          const step = () => {
            if (audio.paused || audio.ended) return;
            pushLevel(rms(analyser, buf));
            ttsRafRef.current = requestAnimationFrame(step);
          };
          ttsRafRef.current = requestAnimationFrame(step);
        }
      });
      audio.addEventListener("ended", endSpeaking);
      audio.addEventListener("pause", endSpeaking);

      try {
        if (ctx && ctx.state === "suspended") await ctx.resume();
        await audio.play();
      } catch (e) {
        endSpeaking();
      }
    },
    [ensureCtx, refreshMode, stopReply]
  );

  /* ── Upload an utterance → STT/AI/TTS → execute + persist history ── */
  const sendBlob = useCallback(
    async (isHandsFree) => {
      const recorder = mediaRecorderRef.current;
      const mime = (recorder && recorder.mimeType) || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];

      if (!blob.size) {
        if (isHandsFree) {
          busyRef.current = false;
          refreshMode();
        } else {
          setPhase("idle");
        }
        return;
      }

      const ext = mime.includes("mp4")
        ? "mp4"
        : mime.includes("ogg")
        ? "ogg"
        : "webm";

      if (isHandsFree) {
        busyRef.current = true;
        refreshMode();
      }

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
          await playReply(`${DOMAIN}/${json.audioUrl}`);
        }

        // Execute the action. performCommand returns a directive for the history
        // JSON: "clear" (succeeded), "append" (show_cheapest → record the list),
        // or "keep" (failed / not understood → leave context for a retry).
        let directive = { history: "keep" };
        if (json.command && typeof cfg.onCommand === "function") {
          try {
            const r = await cfg.onCommand(json.command, json.transcript);
            if (r && r.history) directive = r;
          } catch (e) {
            /* ignore handler errors */
          }
        }

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
        if (isHandsFree) {
          busyRef.current = false;
          refreshMode();
        } else {
          setPhase("idle");
        }
      }
    },
    [setPhase, persistHistory, playReply, refreshMode]
  );

  /* ── Mic analyser: feeds the waves, and (hands-free) the VAD loop ── */
  const stopMicAnalyser = useCallback(() => {
    if (micRafRef.current) {
      cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    try {
      micSrcRef.current && micSrcRef.current.disconnect();
    } catch (e) {
      /* ignore */
    }
    try {
      micAnalyserRef.current && micAnalyserRef.current.disconnect();
    } catch (e) {
      /* ignore */
    }
    micSrcRef.current = null;
    micAnalyserRef.current = null;
    if (!speakingRef.current) levelRef.current = 0;
  }, []);

  const startMicAnalyser = useCallback(
    (stream, vad) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      let analyser;
      try {
        const src = ctx.createMediaStreamSource(stream);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser); // NOT to destination (no mic feedback)
        micSrcRef.current = src;
        micAnalyserRef.current = analyser;
      } catch (e) {
        return;
      }
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const startSegment = () => {
        const s = streamRef.current;
        if (!s) return;
        let recorder;
        try {
          const m = pickMime();
          recorder = m
            ? new MediaRecorder(s, { mimeType: m })
            : new MediaRecorder(s);
        } catch (e) {
          return;
        }
        chunksRef.current = [];
        mediaRecorderRef.current = recorder;
        segActiveRef.current = true;
        quietSinceRef.current = null;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          segActiveRef.current = false;
          refreshMode();
          sendBlob(true);
        };
        recorder.start();
        refreshMode();
      };

      const endSegment = () => {
        quietSinceRef.current = null;
        segActiveRef.current = false; // stop the loop re-checking silence
        try {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
          ) {
            mediaRecorderRef.current.stop(); // onstop → sendBlob
          }
        } catch (e) {
          /* ignore */
        }
      };

      const loop = () => {
        const level = rms(analyser, buf);
        if (!speakingRef.current) pushLevel(level); // TTS owns level while speaking

        if (vad && handsFreeRef.current && !speakingRef.current) {
          const thr = cfgRef.current.micThreshold || 15;
          if (!segActiveRef.current && !busyRef.current && level >= thr) {
            startSegment();
          } else if (segActiveRef.current) {
            if (level <= QUIET_RMS) {
              if (!quietSinceRef.current) quietSinceRef.current = Date.now();
              else if (Date.now() - quietSinceRef.current >= SILENCE_MS) {
                endSegment();
              }
            } else {
              quietSinceRef.current = null;
            }
          }
        }
        micRafRef.current = requestAnimationFrame(loop);
      };

      ctx
        .resume()
        .then(() => {
          micRafRef.current = requestAnimationFrame(loop);
        })
        .catch(() => {
          micRafRef.current = requestAnimationFrame(loop);
        });
    },
    [ensureCtx, refreshMode, sendBlob]
  );

  /* ── Single-shot recording (long-press) ── */
  const startRecording = useCallback(async () => {
    if (stateRef.current !== "idle" || handsFreeRef.current) return;
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

    let recorder;
    try {
      const m = pickMime();
      recorder = m
        ? new MediaRecorder(stream, { mimeType: m })
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
      stopMicAnalyser();
      releaseStream();
      sendBlob(false);
    };
    recorder.start();
    setPhase("recording");
    startMicAnalyser(stream, false); // waves only
    refreshMode();

    // Honor a tap-to-stop that arrived while mic permission was resolving.
    if (pendingStopRef.current) {
      pendingStopRef.current = false;
      setPhase("processing");
      refreshMode();
      try {
        recorder.stop();
      } catch (e) {
        stopMicAnalyser();
        releaseStream();
        setPhase("idle");
        refreshMode();
      }
    }
  }, [
    setPhase,
    releaseStream,
    sendBlob,
    startMicAnalyser,
    stopMicAnalyser,
    refreshMode,
  ]);

  const stopRecording = useCallback(() => {
    if (stateRef.current === "starting") {
      pendingStopRef.current = true;
      return;
    }
    if (stateRef.current !== "recording") return;
    setPhase("processing");
    refreshMode();
    try {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    } catch (e) {
      stopMicAnalyser();
      releaseStream();
      setPhase("idle");
      refreshMode();
    }
  }, [setPhase, releaseStream, stopMicAnalyser, refreshMode]);

  /* ── Hands-free continuous mode ── */
  const startHandsFree = useCallback(async () => {
    if (handsFreeRef.current || stateRef.current !== "idle") return;
    setError(null);

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("unsupported");
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (e) {
      setError("mic-denied");
      return;
    }
    streamRef.current = stream;
    handsFreeRef.current = true;
    setHandsFree(true);
    segActiveRef.current = false;
    busyRef.current = false;
    quietSinceRef.current = null;
    refreshMode();
    startMicAnalyser(stream, true); // VAD on
  }, [refreshMode, startMicAnalyser]);

  const stopHandsFree = useCallback(() => {
    handsFreeRef.current = false;
    setHandsFree(false);
    quietSinceRef.current = null;
    // Discard any in-flight utterance (don't send a half segment on exit).
    const rec = mediaRecorderRef.current;
    if (rec) {
      try {
        rec.onstop = null;
        if (rec.state !== "inactive") rec.stop();
      } catch (e) {
        /* ignore */
      }
    }
    chunksRef.current = [];
    segActiveRef.current = false;
    busyRef.current = false;
    stopMicAnalyser();
    stopReply();
    releaseStream();
    levelRef.current = 0;
    refreshMode();
  }, [stopMicAnalyser, stopReply, releaseStream, refreshMode]);

  /* Explicit "reset the conversation" action (also exposed to the caller). */
  const clearHistory = useCallback(
    () => persistHistory({ action: "clear" }),
    [persistHistory]
  );

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
          mediaRecorderRef.current.onstop = null;
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        /* ignore */
      }
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (ttsRafRef.current) cancelAnimationFrame(ttsRafRef.current);
      try {
        if (ttsAudioRef.current) ttsAudioRef.current.pause();
      } catch (e) {
        /* ignore */
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      try {
        if (audioCtxRef.current) audioCtxRef.current.close();
      } catch (e) {
        /* ignore */
      }
    },
    []
  );

  return {
    state,
    error,
    mode,
    level: levelRef,
    handsFree,
    startRecording,
    stopRecording,
    startHandsFree,
    stopHandsFree,
    clearHistory,
  };
}
