import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";

const MIN_SIZE = 30;
const HANDLE_RADIUS = 14; // hit area for touch

// Which handle/edge is being dragged
// null | 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
function getHandle(pos, crop, threshold) {
  const { x, y, w, h } = crop;
  const t = threshold;

  // Corners first (priority)
  if (Math.abs(pos.x - x) < t && Math.abs(pos.y - y) < t) return "nw";
  if (Math.abs(pos.x - (x + w)) < t && Math.abs(pos.y - y) < t) return "ne";
  if (Math.abs(pos.x - x) < t && Math.abs(pos.y - (y + h)) < t) return "sw";
  if (Math.abs(pos.x - (x + w)) < t && Math.abs(pos.y - (y + h)) < t) return "se";

  // Edges
  if (Math.abs(pos.y - y) < t && pos.x > x && pos.x < x + w) return "n";
  if (Math.abs(pos.y - (y + h)) < t && pos.x > x && pos.x < x + w) return "s";
  if (Math.abs(pos.x - x) < t && pos.y > y && pos.y < y + h) return "w";
  if (Math.abs(pos.x - (x + w)) < t && pos.y > y && pos.y < y + h) return "e";

  // Inside = move
  if (pos.x > x && pos.x < x + w && pos.y > y && pos.y < y + h) return "move";

  return null;
}

function getCursor(handle) {
  switch (handle) {
    case "nw": case "se": return "nwse-resize";
    case "ne": case "sw": return "nesw-resize";
    case "n": case "s": return "ns-resize";
    case "e": case "w": return "ew-resize";
    case "move": return "grab";
    default: return "crosshair";
  }
}

function ImageCropModal({ imageSrc, onDone, onClose }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [imgDims, setImgDims] = useState({ w: 0, h: 0, displayW: 0, displayH: 0 });

  const activeHandle = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropAtStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [cursorStyle, setCursorStyle] = useState("crosshair");

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = Math.min(window.innerWidth - 48, 500);
      const maxH = window.innerHeight * 0.5;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const displayW = img.width * scale;
      const displayH = img.height * scale;
      setImgDims({ w: img.width, h: img.height, displayW, displayH });

      setCrop({ x: 0, y: 0, w: displayW, h: displayH });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    canvas.width = imgDims.displayW;
    canvas.height = imgDims.displayH;
    const ctx = canvas.getContext("2d");

    // Full image
    ctx.drawImage(img, 0, 0, imgDims.displayW, imgDims.displayH);

    // Dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area + redraw
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    ctx.drawImage(
      img,
      (crop.x / imgDims.displayW) * img.width,
      (crop.y / imgDims.displayH) * img.height,
      (crop.w / imgDims.displayW) * img.width,
      (crop.h / imgDims.displayH) * img.height,
      crop.x, crop.y, crop.w, crop.h
    );

    // Rule-of-thirds grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    for (let i = 1; i <= 2; i++) {
      const gx = crop.x + (crop.w * i) / 3;
      const gy = crop.y + (crop.h * i) / 3;
      ctx.beginPath(); ctx.moveTo(gx, crop.y); ctx.lineTo(gx, crop.y + crop.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crop.x, gy); ctx.lineTo(crop.x + crop.w, gy); ctx.stroke();
    }

    // Border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Corner handles (L-shaped brackets)
    ctx.strokeStyle = "#1ed1ff";
    ctx.lineWidth = 3;
    const len = Math.min(20, crop.w / 4, crop.h / 4);
    const corners = [
      { cx: crop.x, cy: crop.y, dx: 1, dy: 1 },
      { cx: crop.x + crop.w, cy: crop.y, dx: -1, dy: 1 },
      { cx: crop.x, cy: crop.y + crop.h, dx: 1, dy: -1 },
      { cx: crop.x + crop.w, cy: crop.y + crop.h, dx: -1, dy: -1 },
    ];
    corners.forEach(({ cx, cy, dx, dy }) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * len, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * len);
      ctx.stroke();
    });

    // Edge midpoint handles (small bars)
    ctx.fillStyle = "#1ed1ff";
    const barW = 18, barH = 4;
    // top & bottom
    ctx.fillRect(crop.x + crop.w / 2 - barW / 2, crop.y - barH / 2, barW, barH);
    ctx.fillRect(crop.x + crop.w / 2 - barW / 2, crop.y + crop.h - barH / 2, barW, barH);
    // left & right
    ctx.fillRect(crop.x - barH / 2, crop.y + crop.h / 2 - barW / 2, barH, barW);
    ctx.fillRect(crop.x + crop.w - barH / 2, crop.y + crop.h / 2 - barW / 2, barH, barW);
  }, [crop, imgDims, imgLoaded]);

  useEffect(() => { draw(); }, [draw]);

  // Get position
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Clamp helper
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const handleStart = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const handle = getHandle(pos, crop, HANDLE_RADIUS);
    if (!handle) return;
    activeHandle.current = handle;
    dragStart.current = pos;
    cropAtStart.current = { ...crop };
    setCursorStyle(handle === "move" ? "grabbing" : getCursor(handle));
  };

  const handleMove = (e) => {
    if (!activeHandle.current) {
      // Hover cursor
      if (!e.touches) {
        const pos = getPos(e);
        const handle = getHandle(pos, crop, HANDLE_RADIUS);
        setCursorStyle(getCursor(handle));
      }
      return;
    }
    e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - dragStart.current.x;
    const dy = pos.y - dragStart.current.y;
    const c = cropAtStart.current;
    const maxW = imgDims.displayW;
    const maxH = imgDims.displayH;

    let nx = c.x, ny = c.y, nw = c.w, nh = c.h;

    switch (activeHandle.current) {
      case "move":
        nx = clamp(c.x + dx, 0, maxW - c.w);
        ny = clamp(c.y + dy, 0, maxH - c.h);
        break;
      case "nw":
        nx = clamp(c.x + dx, 0, c.x + c.w - MIN_SIZE);
        ny = clamp(c.y + dy, 0, c.y + c.h - MIN_SIZE);
        nw = c.x + c.w - nx;
        nh = c.y + c.h - ny;
        break;
      case "ne":
        ny = clamp(c.y + dy, 0, c.y + c.h - MIN_SIZE);
        nw = clamp(c.w + dx, MIN_SIZE, maxW - c.x);
        nh = c.y + c.h - ny;
        break;
      case "sw":
        nx = clamp(c.x + dx, 0, c.x + c.w - MIN_SIZE);
        nw = c.x + c.w - nx;
        nh = clamp(c.h + dy, MIN_SIZE, maxH - c.y);
        break;
      case "se":
        nw = clamp(c.w + dx, MIN_SIZE, maxW - c.x);
        nh = clamp(c.h + dy, MIN_SIZE, maxH - c.y);
        break;
      case "n":
        ny = clamp(c.y + dy, 0, c.y + c.h - MIN_SIZE);
        nh = c.y + c.h - ny;
        break;
      case "s":
        nh = clamp(c.h + dy, MIN_SIZE, maxH - c.y);
        break;
      case "w":
        nx = clamp(c.x + dx, 0, c.x + c.w - MIN_SIZE);
        nw = c.x + c.w - nx;
        break;
      case "e":
        nw = clamp(c.w + dx, MIN_SIZE, maxW - c.x);
        break;
      default: break;
    }

    setCrop({ x: nx, y: ny, w: nw, h: nh });
  };

  const handleEnd = () => {
    activeHandle.current = null;
    setCursorStyle("crosshair");
  };

  // Apply crop
  const applyCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const scaleX = img.width / imgDims.displayW;
    const scaleY = img.height / imgDims.displayH;

    const outCanvas = document.createElement("canvas");
    const sw = crop.w * scaleX;
    const sh = crop.h * scaleY;
    outCanvas.width = sw;
    outCanvas.height = sh;
    const ctx = outCanvas.getContext("2d");
    ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, sw, sh, 0, 0, sw, sh);

    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "cropped.png", { type: "image/png" });
      const preview = outCanvas.toDataURL("image/png");
      onDone(file, preview);
    }, "image/png");
  };

  // Dimensions label
  const cropRealW = imgLoaded ? Math.round((crop.w / imgDims.displayW) * imgDims.w) : 0;
  const cropRealH = imgLoaded ? Math.round((crop.h / imgDims.displayH) * imgDims.h) : 0;

  return ReactDOM.createPortal(
    <div className="crop-overlay" onClick={onClose}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-header">
          <h3>חיתוך תמונה</h3>
          <button className="crop-close" onClick={onClose}>&times;</button>
        </div>

        {imgLoaded && (
          <>
            <div className="crop-canvas-wrap">
              <canvas
                ref={canvasRef}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                style={{ cursor: cursorStyle, touchAction: "none" }}
              />
            </div>

            <div className="crop-info">
              {cropRealW} &times; {cropRealH} px
            </div>

            <div className="crop-actions">
              <button type="button" className="crop-btn cancel" onClick={onClose}>
                ביטול
              </button>
              <button type="button" className="crop-btn apply" onClick={applyCrop}>
                אישור חיתוך
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default ImageCropModal;
