/**
 * Haptic feedback (Web Vibration API — Android Chrome; a silent no-op where
 * unsupported, e.g. iOS Safari).
 *
 * One vocabulary for the whole app so every surface "feels" the same:
 *   selection  – 6ms   tick: choosing an item in a list / sheet
 *   light      – 10ms  tap: opening a menu, a small confirmation
 *   medium     – 18ms  thunk: a sheet or drawer landing
 *   heavy      – 32ms  thud: the robot starts recording
 *   success    – two short rising pulses
 *   warning    – one long pulse
 *   error      – three pulses
 *
 * The user can switch it off (Settings → "רטט"); stored in localStorage.
 */
const KEY = "ui.haptics";
const PATTERNS = {
  selection: [6],
  light: [10],
  medium: [18],
  heavy: [32],
  success: [12, 60, 22],
  warning: [45],
  error: [28, 50, 28, 50, 28],
  // the robot: long-press start / stop recording / hands-free on-off
  recStart: [14, 40, 30],
  recStop: [10, 30, 10],
  listenOn: [10, 50, 10, 50, 22],
  listenOff: [22],
};

let enabled = (() => {
  try {
    const v = localStorage.getItem(KEY);
    return v == null ? true : v === "1";
  } catch {
    return true;
  }
})();

export const isHapticsEnabled = () => enabled;
export function setHapticsEnabled(on) {
  enabled = !!on;
  try {
    localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function haptic(kind = "light") {
  if (!enabled) return;
  try {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    navigator.vibrate(PATTERNS[kind] || PATTERNS.light);
  } catch {
    /* ignore */
  }
}

export default haptic;
