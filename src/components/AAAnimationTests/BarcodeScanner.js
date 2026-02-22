import React, { useEffect, useRef, useState } from "react";
import "./BarcodeScanner.css";
import useProducts from "../../hooks/products/useProducts";
import ProductComparisonModal from "../PriceList/productComparisonModal";
import ProductComparison from "../PriceList/productComparison";

const isBarcodeApiSupported = () => "BarcodeDetector" in window;

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pinchDistanceRef = useRef(0); // Ref to store initial pinch distance

  const { products } = useProducts();

  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);

  // States for camera controls
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });

  const streamRef = useRef(null);
  const trackRef = useRef(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    if (!isBarcodeApiSupported()) {
      setError("הדפדפן שלך אינו תומך בסריקה מהירה. נסה להשתמש בכרום העדכני.");
      setLoading(false);
      return;
    }

    detectorRef.current = new window.BarcodeDetector({
      formats: ["ean_13", "code_128", "upc_a"],
    });

    let animationFrameId;

    async function startScan() {
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

        streamRef.current =
          await navigator.mediaDevices.getUserMedia(constraints);
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = streamRef.current;
        await video.play();

        trackRef.current = streamRef.current.getVideoTracks()[0];
        const capabilities = trackRef.current.getCapabilities();

        if (capabilities.torch) setTorchAvailable(true);
        if (capabilities.zoom) {
          setZoomRange({
            min: capabilities.zoom.min,
            max: capabilities.zoom.max > 12 ? 12 : capabilities.zoom.max,
            step: capabilities.zoom.step,
          });
        }

        setLoading(false);
        scanLoop();
      } catch (e) {
        setError(e.message || "שגיאה בפתיחת המצלמה");
        setLoading(false);
      }
    }

    function scanLoop() {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused) {
        animationFrameId = requestAnimationFrame(scanLoop);
        return;
      }
      const video = videoRef.current,
        canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const cropWidth = video.videoWidth * 0.8,
        cropHeight = video.videoHeight * 0.25;
      const cropX = (video.videoWidth - cropWidth) / 2,
        cropY = (video.videoHeight - cropHeight) / 2;
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
        canvas.height,
      );

      detectorRef.current
        .detect(canvas)
        .then((barcodes) => {
          if (barcodes.length > 0) {
            const detectedBarcode = barcodes[0].rawValue;
            setBarcode(detectedBarcode);

            const productExists = products.some(
              (p) => p.barcode === detectedBarcode,
            );
            if (productExists) {
              setSelectedBarcode(detectedBarcode);
              setIsComparisonModalOpen(true);
            }

            stopAll();
            return;
          }
          animationFrameId = requestAnimationFrame(scanLoop);
        })
        .catch((err) => console.error(err));
    }

    function stopAll() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    }

    startScan();

    return () => {
      stopAll();
    };
  }, []);

  // --- Pinch-to-zoom handlers ---
  const getPinchDistance = (touches) => {
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2),
    );
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchDistanceRef.current = getPinchDistance(event.touches);
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      const newDistance = getPinchDistance(event.touches);
      const initialDistance = pinchDistanceRef.current;

      const newZoom = zoom * (newDistance / initialDistance);
      const clampedZoom = Math.max(
        zoomRange.min,
        Math.min(newZoom, zoomRange.max),
      );

      setZoom(clampedZoom);
      if (trackRef.current) {
        trackRef.current.applyConstraints({
          advanced: [{ zoom: clampedZoom }],
        });
      }
      pinchDistanceRef.current = newDistance;
    }
  };

  const handleTouchEnd = () => {
    pinchDistanceRef.current = 0;
  };

  const toggleTorch = async () => {
    /* ... no changes ... */
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
    setSelectedBarcode(null);
  };

  const handleScanAgain = () => {
    setBarcode("");
    setError("");
    setLoading(true);
    window.location.reload();
  };

  return (
    <>
      <ProductComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={closeComparisonModal}
      >
        <ProductComparison barcode={selectedBarcode} />
      </ProductComparisonModal>

      <div className="bq_page">
        {/* Header */}
        <div className="bq_header">
          <div className="bq_header_icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h2v14H3zM7 5h1v14H7zM11 5h2v14h-2zM15 5h1v14h-1zM19 5h2v14h-2z" />
            </svg>
          </div>
          <h1>סורק ברקוד</h1>
          <p>כוון את המצלמה אל הברקוד לסריקה מהירה</p>
        </div>

        {/* Scanner */}
        <div
          className="bq_scanner"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <video ref={videoRef} className="bq_feed" playsInline autoPlay muted />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {!loading && !error && !barcode && (
            <>
              <div className="bq_frame">
                <span className="bq_corner_bl" />
                <span className="bq_corner_br" />
                <div className="bq_line" />
              </div>
              <p className="bq_zoom_prompt">לא חד? הרחק את הטלפון והשתמש בזום</p>
            </>
          )}

          {!loading && !barcode && torchAvailable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTorch();
              }}
              className="bq_torch_button"
            >
              {torchOn ? "🔦 כבה פנס" : "💡 הפעל פנס"}
            </button>
          )}
        </div>

        {/* Status bar */}
        <div className="bq_status_bar">
          {loading && (
            <div className="bq_status bq_status_loading">
              <span className="bq_spinner" />
              פותח מצלמה…
            </div>
          )}
          {error && (
            <div className="bq_status bq_status_error">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Result card */}
        {barcode && (
          <div className="bq_result_card">
            <div className="bq_result_barcode_icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h2v14H3zM7 5h1v14H7zM11 5h2v14h-2zM15 5h1v14h-1zM19 5h2v14h-2z" />
              </svg>
            </div>
            <div className="bq_result_info">
              <p className="bq_result_label">ברקוד זוהה בהצלחה</p>
              <p className="bq_result_value">{barcode}</p>
            </div>
            <button className="bq_scan_again_btn" onClick={handleScanAgain}>
              סרוק שוב
            </button>
          </div>
        )}

        {/* Tips */}
        {!barcode && !error && (
          <div className="bq_tips">
            <div className="bq_tip">
              <div className="bq_tip_icon bq_tip_icon_light">💡</div>
              <span>ודא תאורה טובה</span>
            </div>
            <div className="bq_tip">
              <div className="bq_tip_icon bq_tip_icon_zoom">🔍</div>
              <span>צבוט לזום</span>
            </div>
            <div className="bq_tip">
              <div className="bq_tip_icon bq_tip_icon_steady">📱</div>
              <span>החזק יציב</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
