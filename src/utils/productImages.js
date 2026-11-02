/**
 * Product image helpers.
 *
 * Every product image comes from ONE place: the backend endpoint
 * `/api/v1/product-images/:barcode`, which serves a small WebP thumbnail
 * (≤256px, ~5KB) with a 30-day browser cache. Nothing is bundled into the
 * JS build any more.
 *
 * Two small pieces of session state make the UI feel instant:
 *   • `loadedOnce` — barcodes whose image has finished loading in this tab.
 *     <ProductImageDisplay> renders those with no skeleton/fade at all.
 *   • `prefetchProductImages()` — warms the browser HTTP cache for images we
 *     are about to need (cart products on boot, neighbouring shelves on the
 *     products page) so they are already there when the user gets there.
 */
import { DOMAIN } from "../constants";

export const productImageUrl = (barcode) =>
  `${DOMAIN}/api/v1/product-images/${encodeURIComponent(String(barcode))}`;

const loadedOnce = new Set();
export const markImageLoaded = (barcode) => {
  if (barcode != null) loadedOnce.add(String(barcode));
};
export const isImageLoaded = (barcode) =>
  barcode != null && loadedOnce.has(String(barcode));

/* ── Prefetch queue ──────────────────────────────────────────────────── */
/* Kept small and low-priority so warming the cache never competes with the
   pictures the user is actually looking at (matters on slow mobile links). */
const MAX_PARALLEL = 3;
const requested = new Set();
const queue = [];
let active = 0;

const saveDataOn = () => {
  try {
    return Boolean(navigator.connection && navigator.connection.saveData);
  } catch {
    return false;
  }
};

function pump() {
  while (active < MAX_PARALLEL && queue.length) {
    const barcode = queue.shift();
    active += 1;
    const img = new Image();
    const finish = (ok) => {
      active -= 1;
      if (ok) loadedOnce.add(barcode);
      pump();
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.decoding = "async";
    try {
      img.fetchPriority = "low"; // visible <img>s always win the bandwidth
    } catch {
      /* older browsers: ignore */
    }
    img.src = productImageUrl(barcode);
  }
}

/**
 * Warm the browser cache for a list of barcodes. De-duplicated per session,
 * capped per call, at most MAX_PARALLEL in flight, skipped when the user
 * asked the browser to save data.
 */
export function prefetchProductImages(barcodes, { limit = 60 } = {}) {
  if (!barcodes || !barcodes.length || saveDataOn()) return;
  let queued = 0;
  for (const raw of barcodes) {
    if (raw == null) continue;
    const barcode = String(raw);
    if (!barcode || requested.has(barcode) || loadedOnce.has(barcode)) continue;
    requested.add(barcode);
    queue.push(barcode);
    queued += 1;
    if (queued >= limit) break;
  }
  if (queued) pump();
}

/**
 * Run `fn` when the browser is idle (falls back to a short timeout).
 * `minDelay` guarantees a quiet period first — e.g. let the visible images
 * of a freshly rendered page finish before warming the next one.
 * Returns a cancel function.
 */
export function whenIdle(
  fn,
  { timeout = 1500, fallbackDelay = 400, minDelay = 0 } = {}
) {
  let cancelIdle = null;
  let cancelled = false;
  const schedule = () => {
    if (cancelled) return;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(fn, { timeout });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(fn, fallbackDelay);
      cancelIdle = () => clearTimeout(id);
    }
  };
  const delayId = minDelay > 0 ? setTimeout(schedule, minDelay) : null;
  if (!delayId) schedule();
  return () => {
    cancelled = true;
    if (delayId) clearTimeout(delayId);
    if (cancelIdle) cancelIdle();
  };
}
