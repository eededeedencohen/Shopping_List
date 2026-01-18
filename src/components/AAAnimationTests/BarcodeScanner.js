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
            // --- ✨ MAX QUALITY REQUEST FOR GALAXY S25 ✨ ---
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
          console.log("Zoom is supported!", capabilities.zoom);
          setZoomRange({
            min: capabilities.zoom.min,
            max: capabilities.zoom.max > 12 ? 12 : capabilities.zoom.max, // Allow high zoom for telephoto
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

            // בדיקה אם הברקוד קיים ברשימת המוצרים
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

    // Cleanup function
    return () => {
      stopAll();
    };
  }, []);

  // --- ✨ PINCH-TO-ZOOM HANDLERS ✨ ---
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
      event.preventDefault(); // Prevent page scroll/zoom
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
      // Update initial distance for smoother scaling on next move
      pinchDistanceRef.current = newDistance;
    }
  };

  const handleTouchEnd = () => {
    pinchDistanceRef.current = 0; // Reset on release
  };

  // --- UI and other handlers ---
  const toggleTorch = async () => {
    /* ... no changes ... */
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
    setSelectedBarcode(null);
  };

  return (
    <>
      <ProductComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={closeComparisonModal}
      >
        <ProductComparison barcode={selectedBarcode} />
      </ProductComparisonModal>

      <div
        className="bq_scanner"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video ref={videoRef} className="bq_feed" playsInline autoPlay muted />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {loading && <p className="bq_status">📷 פותח מצלמה…</p>}
        {error && <p className="bq_status bq_error">{error}</p>}
        {/* שידרוג לחלק הזה */}
        {barcode && <p className="bq_status bq_success">✓ {barcode}</p>}

        {!loading && !error && !barcode && (
          <>
            <div className="bq_frame">
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
    </>
  );
}
