/**
 * "ליווי בסופר" - the store companion.
 *
 * A page of its own with its OWN live basket, independent of the planning
 * cart: the shopper picks the branch they are standing in, then adds every
 * product the moment it goes into the physical trolley (search or barcode
 * camera). Each line is checked against that branch's prices and, when
 * something better exists, the row offers it with one tap:
 *   - a cheaper comparable product sold here (same kind, similar weight)
 *   - a few more units that complete an "N for ₪X" deal
 *   - a product that is not sold here at all, with what to take instead
 * The running total is always on screen, so the checkout brings no surprise.
 *
 * Suggestions are computed LIVE per line (not event-based), so they stay
 * correct after any quantity change, swap or dismissal. The session lives in
 * localStorage so a reload mid-shopping loses nothing.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { DOMAIN } from "../constants";
import { useProducts as useProductsCtx } from "./ProductContext2";
import { getPricesBySupermarketID } from "../services/priceService";
import { calculateTotalPrice } from "../utils/priceCalculations";
import { scanLine, suggestionId } from "../utils/companionScan";
import { haptic } from "../utils/haptics";
import { uiSound } from "../utils/uiSound";

const SESSION_KEY = "companion.session";
const PREFS_KEY = "companion.prefs";
const RECENT_KEY = "companion.recentStores";
const LAST_KEY = "companion.lastSummary";
const RECENT_MAX = 4;
export const SCAN_MS = 760; // the "scanning" beat a row shows before its verdict

const DEFAULT_PREFS = { swaps: true, roundups: true, okToasts: true };

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
};
const writeJson = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};
const validSession = (s) =>
  s && typeof s === "object" && s.store && s.store.supermarketID != null && Array.isArray(s.lines) ? s : null;

const CompanionContext = createContext(null);

export function CompanionProvider({ children }) {
  const { products } = useProductsCtx();

  const [session, setSession] = useState(() => validSession(readJson(SESSION_KEY, null)));
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...readJson(PREFS_KEY, {}) }));
  const [recentStores, setRecentStores] = useState(() => {
    const v = readJson(RECENT_KEY, []);
    return Array.isArray(v) ? v : [];
  });
  const [lastSummary, setLastSummary] = useState(() => readJson(LAST_KEY, null));
  const [storePrices, setStorePrices] = useState({ supermarketID: null, docs: [], loading: false, error: null });

  useEffect(() => writeJson(SESSION_KEY, session), [session]);
  useEffect(() => writeJson(PREFS_KEY, prefs), [prefs]);
  useEffect(() => writeJson(RECENT_KEY, recentStores), [recentStores]);
  useEffect(() => writeJson(LAST_KEY, lastSummary), [lastSummary]);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  /* ── the branch's prices (fetched per session, cached while it lasts) ── */
  const storeID = session ? session.store.supermarketID : null;
  const [pricesAttempt, setPricesAttempt] = useState(0);
  useEffect(() => {
    if (storeID == null) return undefined;
    let cancelled = false;
    setStorePrices((p) => ({ ...p, supermarketID: storeID, loading: true, error: null, docs: p.supermarketID === storeID ? p.docs : [] }));
    (async () => {
      try {
        const docs = await getPricesBySupermarketID(storeID);
        if (cancelled) return;
        setStorePrices({ supermarketID: storeID, docs: docs || [], loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setStorePrices({ supermarketID: storeID, docs: [], loading: false, error: "load" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeID, pricesAttempt]);
  const retryPrices = useCallback(() => setPricesAttempt((n) => n + 1), []);

  const pricesReady = !!session && !storePrices.loading && storePrices.supermarketID === storeID && !storePrices.error;
  const pricesMap = useMemo(
    () => Object.fromEntries((storePrices.docs || []).map((p) => [p.barcode, p])),
    [storePrices.docs]
  );
  const productMap = useMemo(
    () => Object.fromEntries((products || []).map((p) => [p.barcode, p])),
    [products]
  );

  /* ── the live basket: every line joined with its product, price and verdict ── */
  const lines = useMemo(() => {
    if (!session) return [];
    const dismissed = session.dismissed || {};
    return session.lines.map((l) => {
      const product = productMap[l.barcode] || null;
      const priceDoc = pricesMap[l.barcode] || null;
      const lineTotal = priceDoc ? calculateTotalPrice(l.amount, priceDoc) : 0;
      const suggestions =
        product && pricesReady
          ? scanLine({ product, amount: l.amount, priceDoc, products, pricesMap, prefs })
              .map((s) => ({ ...s, id: suggestionId(s) }))
              .filter((s) => !dismissed[s.id])
          : [];
      return {
        ...l,
        product,
        priceDoc,
        sold: !!priceDoc,
        lineTotal: r2(lineTotal),
        suggestions,
      };
    });
  }, [session, productMap, pricesMap, products, prefs, pricesReady]);

  const totals = useMemo(() => {
    let items = 0;
    let total = 0;
    let missing = 0;
    let open = 0;
    for (const l of lines) {
      items += Number(l.amount) || 0;
      total += l.lineTotal;
      if (!l.sold) missing += 1;
      open += l.suggestions.length;
    }
    return { items, lines: lines.length, total: r2(total), missing, open };
  }, [lines]);

  /* ── session lifecycle ── */
  const startSession = useCallback((store) => {
    if (!store || store.supermarketID == null) return;
    const clean = {
      supermarketID: store.supermarketID,
      name: store.name || "",
      address: store.address || "",
      city: store.city || "",
    };
    setSession({
      id: Date.now(),
      store: clean,
      startedAt: Date.now(),
      lines: [],
      applied: [],
      savings: 0,
      dismissed: {},
    });
    setRecentStores((prev) =>
      [clean, ...prev.filter((s) => String(s.supermarketID) !== String(clean.supermarketID))].slice(0, RECENT_MAX)
    );
    haptic("success");
    uiSound("success");
  }, []);

  const endSession = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    setLastSummary({
      store: s.store,
      startedAt: s.startedAt,
      endedAt: Date.now(),
      total: totals.total,
      items: totals.items,
      lines: totals.lines,
      savings: s.savings,
      applied: s.applied.length,
    });
    setSession(null);
    haptic("light");
    uiSound("close");
  }, [totals]);

  /* ── basket edits ── */
  const addProduct = useCallback((barcode, amount = 1) => {
    const now = Date.now();
    let existed = false;
    setSession((s) => {
      if (!s) return s;
      const i = s.lines.findIndex((l) => l.barcode === barcode);
      if (i >= 0) {
        existed = true;
        const lines = s.lines.map((l, j) =>
          j === i ? { ...l, amount: (Number(l.amount) || 0) + amount, touchedAt: now } : l
        );
        return { ...s, lines };
      }
      return {
        ...s,
        lines: [{ barcode, amount, addedAt: now, touchedAt: now, swappedFrom: null }, ...s.lines],
      };
    });
    haptic("light");
    return existed;
  }, []);

  const setAmount = useCallback((barcode, n) => {
    const now = Date.now();
    setSession((s) => {
      if (!s) return s;
      if (!(n > 0)) return { ...s, lines: s.lines.filter((l) => l.barcode !== barcode) };
      return {
        ...s,
        lines: s.lines.map((l) =>
          l.barcode === barcode
            ? { ...l, amount: n, touchedAt: n > (Number(l.amount) || 0) ? now : l.touchedAt }
            : l
        ),
      };
    });
    haptic("selection");
  }, []);

  const removeLine = useCallback((barcode) => {
    setSession((s) => (s ? { ...s, lines: s.lines.filter((l) => l.barcode !== barcode) } : s));
    haptic("light");
  }, []);

  const dismissSuggestion = useCallback((id) => {
    setSession((s) => (s ? { ...s, dismissed: { ...(s.dismissed || {}), [id]: true } } : s));
    haptic("selection");
    uiSound("tap");
  }, []);

  const applySuggestion = useCallback((sug) => {
    if (!sug) return false;
    let ok = false;
    setSession((s) => {
      if (!s) return s;
      const i = s.lines.findIndex((l) => l.barcode === sug.barcode);
      if (i < 0) return s;
      let lines = s.lines;
      if (sug.kind === "roundup") {
        lines = s.lines.map((l, j) => (j === i ? { ...l, amount: sug.target } : l));
      } else if ((sug.kind === "swap" || sug.kind === "missing") && sug.alt) {
        const line = s.lines[i];
        const other = s.lines.findIndex((l) => l.barcode === sug.alt.barcode);
        if (other >= 0) {
          // the alternative is already in the basket: merge into it
          lines = s.lines
            .map((l, j) => (j === other ? { ...l, amount: (Number(l.amount) || 0) + (Number(line.amount) || 0) } : l))
            .filter((_, j) => j !== i);
        } else {
          lines = s.lines.map((l, j) =>
            j === i
              ? {
                  ...l,
                  barcode: sug.alt.barcode,
                  swappedFrom: { barcode: line.barcode, name: sug.product ? sug.product.name : "" },
                }
              : l
          );
        }
      } else {
        return s;
      }
      ok = true;
      const saving = r2(sug.saving);
      return {
        ...s,
        lines,
        savings: r2(s.savings + saving),
        applied: [
          {
            id: sug.id || suggestionId(sug),
            kind: sug.kind,
            at: Date.now(),
            saving,
            name: sug.product ? sug.product.name : "",
            altName: sug.alt ? sug.alt.name : "",
            target: sug.target || null,
          },
          ...s.applied,
        ].slice(0, 80),
      };
    });
    haptic("success");
    uiSound("success");
    return ok;
  }, []);

  const setPref = useCallback((key, value) => setPrefs((p) => ({ ...p, [key]: !!value })), []);

  /* ── save the basket as a purchase in the history ── */
  const saveToHistory = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return null;
    const sold = lines.filter((l) => l.product && l.sold);
    const payload = {
      userID: "1",
      date: new Date().toISOString(),
      supermarketName: s.store.name || "לא ידוע",
      supermarketAddress: s.store.address || "",
      supermarketCity: s.store.city || "",
      totalPrice: totals.total,
      products: sold.map((l) => {
        const p = l.product;
        const d = l.priceDoc;
        const hasDeal = !!(d && d.hasDiscount && d.discount);
        return {
          barcode: l.barcode,
          amount: l.amount,
          name: p.name || "",
          brand: p.brand || "לא ידוע",
          totalPrice: l.lineTotal,
          generalName: p.generalName || p.name || "",
          weight: p.weight || 0,
          unit: p.unitWeight || "u",
          category: p.category || "Other",
          subcategory: p.subcategory || "Other",
          price: d ? d.price : 0,
          hasDiscount: hasDeal,
          discount: hasDeal
            ? { units: d.discount.units, priceForUnit: d.discount.priceForUnit, totalPrice: d.discount.totalPrice }
            : { units: 0, priceForUnit: 0, totalPrice: 0 },
        };
      }),
    };
    const res = await axios.post(`${DOMAIN}/api/v1/history`, payload);
    return res && res.data && res.data.data && res.data.data.history ? res.data.data.history._id : null;
  }, [lines, totals]);

  const value = useMemo(
    () => ({
      session,
      hasSession: !!session,
      store: session ? session.store : null,
      lines,
      totals,
      applied: session ? session.applied : [],
      savings: session ? session.savings : 0,
      prefs,
      setPref,
      recentStores,
      lastSummary,
      pricesReady,
      pricesLoading: storePrices.loading,
      pricesError: storePrices.error,
      retryPrices,
      pricesMap,
      productMap,
      startSession,
      endSession,
      addProduct,
      setAmount,
      removeLine,
      applySuggestion,
      dismissSuggestion,
      saveToHistory,
    }),
    [
      session,
      lines,
      totals,
      prefs,
      setPref,
      recentStores,
      lastSummary,
      pricesReady,
      storePrices.loading,
      storePrices.error,
      retryPrices,
      pricesMap,
      productMap,
      startSession,
      endSession,
      addProduct,
      setAmount,
      removeLine,
      applySuggestion,
      dismissSuggestion,
      saveToHistory,
    ]
  );

  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>;
}

export function useCompanion() {
  const ctx = useContext(CompanionContext);
  if (!ctx) throw new Error("CompanionContext was not provided");
  return ctx;
}

export default CompanionContext;
