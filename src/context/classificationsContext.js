import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { DOMAIN } from "../constants";

/* Classification families — the tag rows (e.g. "סוג" / "אחוז שומן") and
   their values per product family, loaded ONCE from the server so every
   consumer (optimization settings UI, alternatives preview) reads from
   memory. The barcode is the join key: byBarcode tells which family a
   product belongs to and which tag it carries in every row. */

const ClassificationsContext = createContext({
  families: [],
  byFamily: {},
  byBarcode: {},
  isLoaded: false,
});

export const ClassificationsProvider = ({ children }) => {
  const [families, setFamilies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${DOMAIN}/api/v1/classifications`);
        if (!cancelled) setFamilies(res?.data?.data?.families || []);
      } catch (e) {
        console.error("Failed loading classifications:", e);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const byFamily = {};
    const byBarcode = {};
    families.forEach((f) => {
      byFamily[f.family] = f;
      (f.types || []).forEach((t) =>
        (t.values || []).forEach((v) =>
          (v.barcodes || []).forEach((b) => {
            const key = String(b);
            const entry = (byBarcode[key] = byBarcode[key] || {
              family: f.family,
              tags: {},
            });
            entry.tags[t.name] = v.tag;
          })
        )
      );
    });
    return { families, byFamily, byBarcode, isLoaded };
  }, [families, isLoaded]);

  return (
    <ClassificationsContext.Provider value={value}>
      {children}
    </ClassificationsContext.Provider>
  );
};

export const useClassificationsCtx = () => useContext(ClassificationsContext);

/* True when at least one tag is colored — otherwise the rules have no effect
   ("everything white" = everything passes, exactly like before). */
export const classificationRulesActive = (rules) => {
  if (!rules || !rules.rows) return false;
  return Object.values(rules.rows).some(
    (r) =>
      r &&
      ((Array.isArray(r.green) && r.green.length > 0) ||
        (Array.isArray(r.red) && r.red.length > 0))
  );
};

/* Client-side mirror of the server semantics (Utils/classificationsFilter.js):
   red always excludes; a row with greens is a whitelist (a candidate missing
   that row's tag is excluded); a product with no tags in the family at all
   passes untouched. Used by the alternatives preview modal. */
export const barcodePassesClassificationRules = (barcode, rules, byBarcode) => {
  if (!classificationRulesActive(rules)) return true;
  const info = byBarcode[String(barcode)];
  if (!info || info.family !== rules.family) return true; // untagged → as before
  for (const [rowName, rule] of Object.entries(rules.rows || {})) {
    if (!rule) continue;
    const tag = info.tags[rowName];
    if ((rule.red || []).includes(tag)) return false;
    const greens = rule.green || [];
    if (greens.length > 0 && !greens.includes(tag)) return false;
  }
  return true;
};
