import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useEnrichedProducts, useCartActions } from "../../hooks/appHooks";
import { calculateTotalPrice } from "../../utils/priceCalculations"; // ⬅️ util


const ProductsListTest = () => {
  const { productsWithDetails, isLoadingProducts } = useEnrichedProducts();
  const { add, update, remove } = useCartActions();

  /* טיוטות כמויות (barcode -> number) */
  const [draft, setDraft] = useState({});

  const draftVal   = (bcode, current) => draft[bcode] ?? current;
  const changeDraft = (bcode, v) => setDraft((p) => ({ ...p, [bcode]: v }));
  const clearDraft  = (bcode) =>
    setDraft(({ [bcode]: _, ...rest }) => rest);

  if (isLoadingProducts) return <div>טוען מוצרים…</div>;

  return (
    <div style={{ padding: 20 }}>
      <Link to="/cart-test">
        <button style={{ marginBottom: 12 }}>⮌ לעמוד עגלה</button>
      </Link>

      <h2>Products List Test</h2>

      {productsWithDetails.map((p) => {
        const curQty   = p.amountInCart;
        const draftQty = draftVal(p.barcode, curQty);
        const changed  = curQty !== draftQty;

        return (
          <div key={p.barcode}
               style={{ border:"1px solid #ddd", margin:"10px 0", padding:10 }}>
            <strong>{p.name}</strong> – {p.brand}<br/>
            ברקוד: {p.barcode} | משקל: {p.weight}<br/>
            מחיר יח׳: {p.unitPrice ?? "—"}₪
            {p.promoText && (
              <span style={{ color:"green", marginInlineStart:6 }}>
                (מבצע: {p.promoText})
              </span>
            )}
            <br/>

            {curQty === 0 ? (
              /*  מוצר שלא בעגלה – כפתור הוספה פשוט */
              <button onClick={() => add(p.barcode, 1)}>הוסף לעגלה</button>
            ) : (
              /*  מוצר קיים – אזור עריכת כמות */
              <>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                  {/* כמות נוכחית */}
                  {changed && (
                    <>
                      <span style={{
                        padding:"4px 10px", background:"#eee",
                        border:"1px solid #aaa", borderRadius:4,
                        minWidth:32, textAlign:"center"
                      }}>
                        {curQty}
                      </span>
                      <span style={{ fontSize:20 }}>→</span>
                    </>
                  )}

                  {/* ‎➖ */}
                  <button
                    onClick={() => changeDraft(p.barcode, Math.max(1, draftQty-1))}
                  >
                    ➖
                  </button>

                  {/* תיבת עריכה */}
                  <input
                    type="number"
                    min={1}
                    value={draftQty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value,10);
                      if (!isNaN(v) && v>=1) changeDraft(p.barcode,v);
                    }}
                    style={{
                      width:60, textAlign:"center",
                      border: changed ? "2px solid #673ab7" : undefined
                    }}
                  />

                  {/* ‎➕ */}
                  <button onClick={() => changeDraft(p.barcode, draftQty+1)}>➕</button>

                  {/* עדכן / מחק */}
                  <button
                    disabled={!changed}
                    onClick={()=>{
                      update(p.barcode, draftQty);
                      clearDraft(p.barcode);
                    }}
                    style={{ marginInlineStart:4 }}
                  >
                    עדכן
                  </button>
                  <button onClick={() => remove(p.barcode)}>מחק</button>
                </div>

                {/* סכום כולל למוצר */}
                <div style={{ marginTop:4 }}>
                  סה״כ:&nbsp;
                  {changed ? (
                    <>
                      <strong>
                        {calculateTotalPrice(draftQty,p).toFixed(2)}₪
                      </strong> &rarr; {p.totalPrice.toFixed(2)}₪
                    </>
                  ) : (
                    <>{p.totalPrice.toFixed(2)}₪</>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductsListTest;
