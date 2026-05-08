import React, { useCallback, useEffect, useRef, useState } from "react";
import "./BarcodeScanner.css";
import ProductComparisonModal from "../PriceList/productComparisonModal";
import ProductComparison from "../PriceList/productComparison";

const isBarcodeApiSupported = () => "BarcodeDetector" in window;

/* Short, pleasant beep on a successful scan via the Web Audio API.
   Lazy-creates the AudioContext on first use (most browsers require a
   prior user gesture — the page open / first scan suffices). */
const audioCtxRef = { current: null };
function playScanBeep() {
  try {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.32, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    /* ignore audio errors — silent failure is fine */
  }
}

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pinchDistanceRef = useRef(0);

  const streamRef = useRef(null);
  const trackRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const isScanningRef = useRef(false);

  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });

  /* ── Scan loop ──────────────────────────────────────────── */
  const scanLoop = useCallback(() => {
    if (!isScanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    const ctx = canvas.getContext("2d");
    const cropWidth = video.videoWidth * 0.8;
    const cropHeight = video.videoHeight * 0.25;
    const cropX = (video.videoWidth - cropWidth) / 2;
    const cropY = (video.videoHeight - cropHeight) / 2;
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    detectorRef.current
      .detect(canvas)
      .then((barcodes) => {
        if (!isScanningRef.current) return;
        if (barcodes.length > 0) {
          const detected = barcodes[0].rawValue;
          isScanningRef.current = false;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          playScanBeep();
          if (navigator.vibrate) navigator.vibrate(60);
          setBarcode(detected);
          setSelectedBarcode(detected);
          setIsComparisonModalOpen(true);
          stopCamera();
          return;
        }
        rafRef.current = requestAnimationFrame(scanLoop);
      })
      .catch((err) => {
        console.error(err);
        if (isScanningRef.current) {
          rafRef.current = requestAnimationFrame(scanLoop);
        }
      });
  }, []);

  /* ── Camera lifecycle ──────────────────────────────────── */
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError("");
    setLoading(true);
    setBarcode("");

    if (!isBarcodeApiSupported()) {
      setError("הדפדפן שלך אינו תומך בסריקה מהירה. נסה Chrome עדכני.");
      setLoading(false);
      return;
    }

    if (!detectorRef.current) {
      detectorRef.current = new window.BarcodeDetector({
        formats: ["ean_13", "code_128", "upc_a"],
      });
    }

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          focusMode: "continuous",
        },
        audio: false,
      };
      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = streamRef.current;
      await video.play();

      trackRef.current = streamRef.current.getVideoTracks()[0];
      const capabilities = trackRef.current.getCapabilities
        ? trackRef.current.getCapabilities()
        : {};
      if (capabilities.zoom) {
        setZoomRange({
          min: capabilities.zoom.min,
          max: capabilities.zoom.max > 12 ? 12 : capabilities.zoom.max,
          step: capabilities.zoom.step || 0.1,
        });
      }

      setLoading(false);
      isScanningRef.current = true;
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch (e) {
      setError(e.message || "שגיאה בפתיחת המצלמה");
      setLoading(false);
    }
  }, [scanLoop]);

  /* ── Mount / unmount ───────────────────────────────────── */
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Pinch-to-zoom (kept — quietly useful) ────────────── */
  const getPinchDistance = (touches) => {
    const [a, b] = touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) pinchDistanceRef.current = getPinchDistance(e.touches);
  };
  const handleTouchMove = (e) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const next = getPinchDistance(e.touches);
    const initial = pinchDistanceRef.current;
    const newZoom = zoom * (next / initial);
    const clamped = Math.max(zoomRange.min, Math.min(newZoom, zoomRange.max));
    setZoom(clamped);
    if (trackRef.current) {
      trackRef.current
        .applyConstraints({ advanced: [{ zoom: clamped }] })
        .catch(() => {});
    }
    pinchDistanceRef.current = next;
  };
  const handleTouchEnd = () => {
    pinchDistanceRef.current = 0;
  };

  /* ── Modal handlers ────────────────────────────────────── */
  const closeComparisonModal = useCallback(() => {
    setIsComparisonModalOpen(false);
    setSelectedBarcode(null);
    // Resume scanning seamlessly when the modal closes
    startCamera();
  }, [startCamera]);

  const handleScanAgain = useCallback(() => {
    setBarcode("");
    setSelectedBarcode(null);
    setIsComparisonModalOpen(false);
    startCamera();
  }, [startCamera]);

  return (
    <>
      <ProductComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={closeComparisonModal}
      >
        <ProductComparison barcode={selectedBarcode} />
      </ProductComparisonModal>

      <div className="bq_page">
        <div className="bq_header">
          <h1>סורק ברקוד</h1>
          <p>כוון את המצלמה אל הברקוד</p>
        </div>

        <div
          className="bq_scanner"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <video ref={videoRef} className="bq_feed" playsInline autoPlay muted />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {!loading && !error && !barcode && (
            <div className="bq_frame">
              <span className="bq_corner_bl" />
              <span className="bq_corner_br" />
              <div className="bq_line" />
            </div>
          )}

          {loading && (
            <div className="bq_overlay_status">
              <span className="bq_spinner" />
              <span>פותח מצלמה…</span>
            </div>
          )}
          {error && <div className="bq_overlay_status bq_overlay_error">{error}</div>}
        </div>

        {barcode && (
          <div className="bq_result_card">
            <div className="bq_result_barcode_icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h2v14H3zM7 5h1v14H7zM11 5h2v14h-2zM15 5h1v14h-1zM19 5h2v14h-2z" />
              </svg>
            </div>
            <div className="bq_result_info">
              <p className="bq_result_label">ברקוד נסרק</p>
              <p className="bq_result_value">{barcode}</p>
            </div>
            <button className="bq_scan_again_btn" onClick={handleScanAgain}>
              סרוק שוב
            </button>
          </div>
        )}
      </div>
    </>
  );
}
