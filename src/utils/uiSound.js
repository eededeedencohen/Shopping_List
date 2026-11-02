/**
 * Tiny UI sound-design kit — every sound is synthesized with Web Audio on the
 * fly (no audio files, nothing to download), tuned to be short, soft and
 * musical so they never compete with the robot's spoken replies.
 *
 *   tap        – a soft "tock"              (coin press)
 *   open       – two rising notes           (sheet / drawer opens)
 *   close      – two falling notes          (sheet / drawer closes)
 *   select     – a bright short "tick"      (choosing an action / nav item)
 *   recStart   – rising chirp               (robot starts listening)
 *   recStop    – falling double tick        (recording sent)
 *   listenOn   – three ascending blips      (hands-free on)
 *   listenOff  – one low blip               (hands-free off)
 *   success    – major-triad arpeggio       (an action completed)
 *   error      – two low buzzes
 *
 * Volume is deliberately low (master gain 0.12). The user can switch the
 * sounds off (Settings → "צלילי ממשק"); stored in localStorage.
 */
const KEY = "ui.sounds";
const MASTER_GAIN = 0.12;

let enabled = (() => {
  try {
    const v = localStorage.getItem(KEY);
    return v == null ? true : v === "1";
  } catch {
    return true;
  }
})();

export const isUiSoundEnabled = () => enabled;
export function setUiSoundEnabled(on) {
  enabled = !!on;
  try {
    localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

let ctx = null;
let master = null;
function getCtx() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

/* One enveloped note. `type` = oscillator wave; freq may glide to `to`. */
function note(ac, { t = 0, freq = 600, to = null, dur = 0.08, type = "sine", gain = 1, attack = 0.004, release = 0.06 }) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const start = ac.currentTime + t;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.setValueAtTime(gain, start + Math.max(attack, dur - release));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur + 0.02);
  osc.connect(g);
  g.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/* A very short filtered noise burst — the "tock" body of a tap. */
function tock(ac, { t = 0, dur = 0.035, gain = 0.6, freq = 900 }) {
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 1.2;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(ac.currentTime + t);
}

const SOUNDS = {
  tap: (ac) => {
    tock(ac, { gain: 0.5, freq: 1100 });
    note(ac, { freq: 520, to: 440, dur: 0.06, gain: 0.5, type: "triangle" });
  },
  open: (ac) => {
    note(ac, { t: 0, freq: 523, dur: 0.09, gain: 0.7, type: "triangle" });
    note(ac, { t: 0.07, freq: 784, dur: 0.12, gain: 0.8, type: "triangle" });
  },
  close: (ac) => {
    note(ac, { t: 0, freq: 659, dur: 0.08, gain: 0.55, type: "triangle" });
    note(ac, { t: 0.06, freq: 440, dur: 0.11, gain: 0.5, type: "triangle" });
  },
  select: (ac) => {
    tock(ac, { gain: 0.35, freq: 1600, dur: 0.025 });
    note(ac, { freq: 1046, dur: 0.05, gain: 0.45, type: "sine" });
  },
  recStart: (ac) => {
    note(ac, { freq: 440, to: 880, dur: 0.16, gain: 0.8, type: "sine" });
    note(ac, { t: 0.14, freq: 1174, dur: 0.1, gain: 0.5, type: "sine" });
  },
  recStop: (ac) => {
    note(ac, { t: 0, freq: 988, dur: 0.06, gain: 0.6, type: "sine" });
    note(ac, { t: 0.07, freq: 659, dur: 0.1, gain: 0.55, type: "sine" });
  },
  listenOn: (ac) => {
    note(ac, { t: 0, freq: 587, dur: 0.07, gain: 0.6, type: "triangle" });
    note(ac, { t: 0.08, freq: 784, dur: 0.07, gain: 0.65, type: "triangle" });
    note(ac, { t: 0.16, freq: 1046, dur: 0.12, gain: 0.7, type: "triangle" });
  },
  listenOff: (ac) => {
    note(ac, { t: 0, freq: 659, dur: 0.07, gain: 0.55, type: "triangle" });
    note(ac, { t: 0.08, freq: 392, dur: 0.14, gain: 0.55, type: "triangle" });
  },
  success: (ac) => {
    note(ac, { t: 0, freq: 659, dur: 0.08, gain: 0.6, type: "triangle" });
    note(ac, { t: 0.08, freq: 830, dur: 0.08, gain: 0.65, type: "triangle" });
    note(ac, { t: 0.16, freq: 1046, dur: 0.18, gain: 0.7, type: "triangle" });
  },
  error: (ac) => {
    note(ac, { t: 0, freq: 220, dur: 0.12, gain: 0.7, type: "square", release: 0.03 });
    note(ac, { t: 0.15, freq: 185, dur: 0.16, gain: 0.7, type: "square", release: 0.03 });
  },
};

/** Play a UI sound (no-op when disabled / unsupported / before any gesture). */
export function uiSound(kind = "tap") {
  if (!enabled) return;
  const ac = getCtx();
  if (!ac || !master) return;
  const fn = SOUNDS[kind];
  if (!fn) return;
  try {
    fn(ac);
  } catch {
    /* ignore */
  }
}

/** Warm the audio context on the first user gesture so the first sound is on time. */
export function primeUiSound() {
  if (!enabled) return;
  getCtx();
}

export default uiSound;
