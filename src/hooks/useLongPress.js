import { useRef, useState } from "react";

export function useLongPress(callback, duration = 2000) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const startTime = useRef(null);

  const start = (e) => {
    e.preventDefault();
    startTime.current = Date.now();

    // אנימציית טעינה
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const ratio = Math.min(elapsed / duration, 1);
      setProgress(ratio);
      if (navigator.vibrate) navigator.vibrate(15); // רטט קטן
      if (ratio === 1) {
        clear();
        callback(e);
      }
    }, 50);

    // ביטוח זמן סיום
    timerRef.current = setTimeout(() => {
      clear();
      callback(e);
    }, duration);
  };

  const clear = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    setProgress(0);
  };

  return {
    progress,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}
