import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./BarcodeScanner.css";

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const [barcode, set] = useState("");
  const [err, setErr] = useState("");
  const [loading, setL] = useState(true);

  useEffect(() => {
    let reader; // ← יאותחל מאוחר יותר
    let stream;

    async function start() {
      try {
        reader = new BrowserMultiFormatReader();
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) throw new Error("No camera found");

        const backCam = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        const deviceId = (backCam ?? devices[0]).deviceId;

        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: false,
        });

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        await reader.decodeFromVideoDevice(deviceId, video, (result) => {
          if (result) {
            set(result.getText());
            stopAll();
          }
        });
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setL(false);
      }
    }

    function stopAll() {
      reader?.reset();
      stream?.getTracks().forEach((t) => t.stop());
    }

    start();
    return stopAll;
  }, []);

  /* ─── UI ─── */
  return (
    <div className="bq_scanner">
      {/* הווידאו קיים תמיד, ולכן ref לעולם לא null */}
      <video ref={videoRef} className="bq_feed" playsInline autoPlay muted />

      {/* שכבת overlay בהתאם למצב */}
      {loading && <p className="bq_status">📷 פותח מצלמה…</p>}
      {err && <p className="bq_status bq_error">{err}</p>}
      {barcode && <p className="bq_status bq_success">✓ {barcode}</p>}

      {/* מסגרת + לייזר רק כשהמצלמה פעילה ולא נמצא קוד */}
      {!loading && !err && !barcode && (
        <div className="bq_frame">
          <div className="bq_line" />
        </div>
      )}
    </div>
  );
}
