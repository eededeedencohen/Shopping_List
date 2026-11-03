/**
 * ScannerView - the app's ONE barcode viewfinder.
 *
 * A dark camera stage with a clear scan window (glowing corner brackets, a
 * sweeping laser), a glass status pill, torch / zoom controls when the
 * camera supports them, pinch-to-zoom, a manual-entry bar, and a friendly
 * fallback when there is no camera or no BarcodeDetector (then the manual
 * bar is the way in). Used by the standalone /barcode-scanner page (single
 * shot → price comparison) and by the companion's scan sheet (continuous:
 * scan, scan, scan).
 *
 *   active      camera on while true (the sheet passes its open state)
 *   paused      keep the picture, stop detecting (single-shot after a hit)
 *   mode        "single" | "continuous"
 *   onDetected  (code) → in continuous mode may return {ok, text} for the
 *               in-stage flash; in single mode the parent pauses the view
 *   hint        the status text while live
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "../../utils/haptics";
import "./ScannerView.css";

const DETECT_EVERY_MS = 110; // ~9 detections a second is plenty and keeps the phone cool
const HIT_MS = 650;
const FLASH_MS = 1800;
const REPEAT_GUARD_MS = 2600; // the same code again within this window is ignored (continuous)
const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"];

/* a short, pleasant scanner beep (Web Audio, no asset) */
const audioRef = { ctx: null };
function scanBeep() {
  try {
    if (!audioRef.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioRef.ctx = new AC();
    }
    const ctx = audioRef.ctx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    /* ignore */
  }
}

const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const IconBarcode = () => (
  <svg {...ico}>
    <path d="M4 6v12M8 6v12M11 6v12M15 6v12M18 6v12M20 6v12" />
  </svg>
);
const IconCameraOff = () => (
  <svg {...ico}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.5-2h4l1.5 2h2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8z" />
    <circle cx="12" cy="12.5" r="3.2" />
    <path d="M3 3l18 18" />
  </svg>
);
const IconFlash = () => (
  <svg {...ico}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H13l1-8.5z" />
  </svg>
);
const IconPlus = () => (
  <svg {...ico} strokeWidth="2.8">
    <path d="M12 6v12M6 12h12" />
  </svg>
);
const IconMinus = () => (
  <svg {...ico} strokeWidth="2.8">
    <path d="M6 12h12" />
  </svg>
);
const IconCheck = () => (
  <svg {...ico} strokeWidth="3.2">
    <polyline points="4.5 12.5 9.5 17.5 19.5 7" />
  </svg>
);
const IconArrowIn = () => (
  <svg {...ico} strokeWidth="2.6">
    <path d="M19 12H6M11 7l-5 5 5 5" />
  </svg>
);

const supported = () => typeof window !== "undefined" && "BarcodeDetector" in window && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

export default function ScannerView({
  active = true,
  paused = false,
  mode = "single",
  onDetected,
  hint = "כוונו את המצלמה אל הברקוד",
  manual = true,
  className = "",
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const trackRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const liveRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const lastRef = useRef({ code: "", at: 0 });
  const lastDetectRef = useRef(0);
  const pinchRef = useRef(0);
  const timers = useRef({ hit: null, flash: null });

  const [status, setStatus] = useState("opening"); // opening | live | error | unsupported
  const [hit, setHit] = useState(false);
  const [flash, setFlash] = useState(null); // {ok, text}
  const [torch, setTorch] = useState({ available: false, on: false });
  const [zoom, setZoom] = useState({ available: false, min: 1, max: 1, step: 0.1, value: 1 });
  const [manualValue, setManualValue] = useState("");

  const handle = useCallback(
    (code, source) => {
      const now = Date.now();
      if (mode === "continuous" && lastRef.current.code === code && now - lastRef.current.at < REPEAT_GUARD_MS) return;
      lastRef.current = { code, at: now };
      scanBeep();
      haptic("success");
      setHit(true);
      clearTimeout(timers.current.hit);
      timers.current.hit = setTimeout(() => setHit(false), HIT_MS);
      const res = onDetectedRef.current ? onDetectedRef.current(code, source) : null;
      if (res && typeof res === "object" && res.text) {
        setFlash(res);
        clearTimeout(timers.current.flash);
        timers.current.flash = setTimeout(() => setFlash(null), FLASH_MS);
      }
    },
    [mode]
  );

  const stopCamera = useCallback(() => {
    liveRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
  }, []);

  /* the detection loop: throttled, skipped while paused, detects on the
     whole frame (the window is a visual guide; the detector finds the code
     anywhere, which is friendlier than a tight crop) */
  const loop = useCallback(
    (ts) => {
      if (!liveRef.current) return;
      rafRef.current = requestAnimationFrame(loop);
      if (pausedRef.current) return;
      if (ts - lastDetectRef.current < DETECT_EVERY_MS) return;
      lastDetectRef.current = ts;
      const v = videoRef.current;
      if (!v || v.readyState < 2 || !detectorRef.current) return;
      detectorRef.current
        .detect(v)
        .then((codes) => {
          if (!liveRef.current || pausedRef.current) return;
          const found = codes && codes.find((c) => c && c.rawValue);
          if (found) handle(found.rawValue, "camera");
        })
        .catch(() => {});
    },
    [handle]
  );

  useEffect(() => {
    if (!active) {
      stopCamera();
      return undefined;
    }
    let cancelled = false;
    setFlash(null);
    setHit(false);
    if (!supported()) {
      setStatus("unsupported");
      return undefined;
    }
    setStatus("opening");
    (async () => {
      try {
        if (!detectorRef.current) detectorRef.current = new window.BarcodeDetector({ formats: FORMATS });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();
        const track = stream.getVideoTracks()[0];
        trackRef.current = track;
        const caps = track && track.getCapabilities ? track.getCapabilities() : {};
        setTorch({ available: !!caps.torch, on: false });
        if (caps.zoom && Number.isFinite(caps.zoom.max) && caps.zoom.max > caps.zoom.min) {
          setZoom({ available: true, min: caps.zoom.min, max: Math.min(caps.zoom.max, 8), step: caps.zoom.step || 0.1, value: caps.zoom.min });
        } else {
          setZoom({ available: false, min: 1, max: 1, step: 0.1, value: 1 });
        }
        if (cancelled) return;
        setStatus("live");
        liveRef.current = true;
        lastDetectRef.current = 0;
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [active, loop, stopCamera]);

  useEffect(
    () => () => {
      clearTimeout(timers.current.hit);
      clearTimeout(timers.current.flash);
    },
    []
  );

  const applyZoom = (value) => {
    const z = Math.min(zoom.max, Math.max(zoom.min, value));
    setZoom((s) => ({ ...s, value: z }));
    if (trackRef.current) trackRef.current.applyConstraints({ advanced: [{ zoom: z }] }).catch(() => {});
  };
  const toggleTorch = () => {
    const next = !torch.on;
    setTorch((t) => ({ ...t, on: next }));
    haptic("selection");
    if (trackRef.current) trackRef.current.applyConstraints({ advanced: [{ torch: next }] }).catch(() => {});
  };

  /* pinch to zoom */
  const dist = (t) => Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
  const onTouchStart = (e) => {
    if (e.touches.length === 2) pinchRef.current = dist(e.touches);
  };
  const onTouchMove = (e) => {
    if (e.touches.length !== 2 || !zoom.available || !pinchRef.current) return;
    e.preventDefault();
    const d = dist(e.touches);
    applyZoom(zoom.value * (d / pinchRef.current));
    pinchRef.current = d;
  };
  const onTouchEnd = () => {
    pinchRef.current = 0;
  };

  const submitManual = (e) => {
    e.preventDefault();
    const code = manualValue.trim();
    if (code.length < 5) return;
    handle(code, "manual");
    setManualValue("");
  };

  const statusText =
    status === "opening"
      ? "פותח את המצלמה..."
      : status === "live"
        ? paused
          ? "נסרק"
          : hint
        : status === "error"
          ? "אין גישה למצלמה"
          : "אין סריקה במצלמה בדפדפן הזה";

  return (
    <div
      className={`scn scn--${status}${hit ? " is-hit" : ""}${paused ? " is-paused" : ""}${mode === "continuous" ? " scn--continuous" : ""} ${className}`}
      dir="rtl"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <video ref={videoRef} className="scn__video" playsInline autoPlay muted />
      <div className="scn__shade" aria-hidden="true" />

      {(status === "live" || status === "opening") && (
        <div className="scn__window" aria-hidden="true">
          <span className="scn__corner scn__corner--tl" />
          <span className="scn__corner scn__corner--tr" />
          <span className="scn__corner scn__corner--bl" />
          <span className="scn__corner scn__corner--br" />
          <span className="scn__laser" />
          <span className="scn__hitmark">
            <IconCheck />
          </span>
        </div>
      )}

      <div className={`scn__status scn__status--${status}`} role="status">
        <span className="scn__status-dot" aria-hidden="true" />
        <span>{statusText}</span>
      </div>

      {status === "live" && (torch.available || zoom.available) && (
        <div className="scn__tools">
          {torch.available && (
            <button type="button" className={`scn__tool${torch.on ? " is-on" : ""}`} onClick={toggleTorch} aria-label={torch.on ? "כבה פנס" : "הדלק פנס"} aria-pressed={torch.on}>
              <IconFlash />
            </button>
          )}
          {zoom.available && (
            <div className="scn__zoom" aria-label="זום">
              <button type="button" className="scn__tool" onClick={() => applyZoom(zoom.value + Math.max(zoom.step, 0.5))} aria-label="הגדל">
                <IconPlus />
              </button>
              <span className="scn__zoom-value">{zoom.value.toFixed(1)}x</span>
              <button type="button" className="scn__tool" onClick={() => applyZoom(zoom.value - Math.max(zoom.step, 0.5))} aria-label="הקטן">
                <IconMinus />
              </button>
            </div>
          )}
        </div>
      )}

      {(status === "error" || status === "unsupported") && (
        <div className="scn__fallback">
          <span className="scn__fallback-icon" aria-hidden="true">
            <IconCameraOff />
          </span>
          <span className="scn__fallback-title">{status === "error" ? "המצלמה לא נפתחה" : "הדפדפן לא תומך בסריקה"}</span>
          <span className="scn__fallback-text">
            {status === "error"
              ? "בדקו שאישרתם גישה למצלמה, או הקלידו את הברקוד למטה."
              : "אפשר להקליד את הברקוד שמתחת לפסים, והמוצר יזוהה מיד."}
          </span>
        </div>
      )}

      {flash && <div className={`scn__flash${flash.ok ? " is-ok" : " is-bad"}`}>{flash.text}</div>}

      {manual && (
        <form className="scn__manual" onSubmit={submitManual}>
          <span className="scn__manual-icon" aria-hidden="true">
            <IconBarcode />
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value.replace(/\D/g, ""))}
            placeholder="או הקלידו ברקוד"
            aria-label="הקלדת ברקוד"
          />
          <button type="submit" className="scn__manual-go" disabled={manualValue.trim().length < 5} aria-label="חפש ברקוד">
            <IconArrowIn />
          </button>
        </form>
      )}
    </div>
  );
}
