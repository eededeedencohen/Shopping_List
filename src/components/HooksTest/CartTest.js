// src/test-components/CartTest.js
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useCartState,
  useCartTotals,
  useCartActions,
  useCartItems,
} from "../../hooks/appHooks";
import { calculateTotalPrice } from "../../utils/priceCalculations"; // ⬅️ util

const CartTest = () => {
  const { cart, isLoading }         = useCartState();          // ← קיבלנו גם cart
  const { totalAmount, totalPrice } = useCartTotals();
  const { update, remove, replaceSupermarket } = useCartActions();
  const cartItems                   = useCartItems();

  /* ─── טיוטות כמויות ────────────────────────────────────────── */
  const [draftAmounts, setDraftAmounts] = useState({});
  const draftTotals = useMemo(() => {
    let amt=0, price=0;
    cartItems.forEach((i)=>{
      const q = draftAmounts[i.barcode] ?? i.amountInCart;
      amt   += q;
      price += calculateTotalPrice(q,i);
    });
    return { amt, price };
  },[cartItems,draftAmounts]);

  /* ─── טיוטת SupermarketID ─────────────────────────────────── */
  const [smDraft, setSmDraft] = useState("");

  if (isLoading)         return <div>טוען עגלה…</div>;
  if (!cartItems.length) return (
    <div style={{ padding:20 }}>
      <Link to="/products-list-test"><button>⮌ לעמוד רשימת מוצרים</button></Link>
      <p>העגלה ריקה</p>
    </div>
  );

  const draftOrCurrent = (it)=> draftAmounts[it.barcode] ?? it.amountInCart;
  const setDraft  = (b,v)=> setDraftAmounts(p=>({...p,[b]:v}));
  const clearDraft= (b)=>  setDraftAmounts(({[b]:_,...r})=>r);

  /* === JSX =================================================== */
  return (
    <div style={{ padding:20 }}>
      <Link to="/products-list-test">
        <button style={{ marginBottom:12 }}>⮌ לעמוד רשימת מוצרים</button>
      </Link>

      {/* ── מחליף סופרמרקט ─────────────────────── */}
      <div style={{
        border:"1px solid #999", padding:8, marginBottom:16,
        maxWidth:260, borderRadius:4
      }}>
        <div>Supermarket&nbsp;ID נוכחי:&nbsp;
          <strong>{cart.supermarketID}</strong>
        </div>
        <div style={{ marginTop:6, display:"flex", gap:6 }}>
          <input
            type="number"
            value={smDraft}
            placeholder="SMID חדש"
            onChange={(e)=> setSmDraft(e.target.value)}
            style={{ flex:1 }}
          />
          <button
            disabled={
              smDraft==="" ||
              Number(smDraft)===cart.supermarketID
            }
            onClick={()=>{
              replaceSupermarket(Number(smDraft));
              setSmDraft("");
            }}
          >
            החלף
          </button>
        </div>
      </div>

      <h2>Cart Test</h2>
      <p>
        סה״כ פריטים:&nbsp;
        {totalAmount===draftTotals.amt
          ? <strong>{totalAmount}</strong>
          : <><strong>{draftTotals.amt}</strong> &rarr; {totalAmount}</>}
        &nbsp;|&nbsp;
        סה״כ מחיר:&nbsp;
        {totalPrice.toFixed(2)===draftTotals.price.toFixed(2)
          ? <strong>{totalPrice.toFixed(2)}₪</strong>
          : <>
              <strong>{draftTotals.price.toFixed(2)}₪</strong> &rarr;{" "}
              {totalPrice.toFixed(2)}₪
            </>}
      </p>

      {cartItems.map((it)=>{
        const d   = draftOrCurrent(it);
        const chg = d!==it.amountInCart;
        const cur = calculateTotalPrice(it.amountInCart,it);
        const neu = calculateTotalPrice(d,it);

        return (
          <div key={it.barcode}
               style={{border:"1px solid #ccc",margin:"10px 0",padding:10}}>
            <strong>{it.name}</strong> – {it.brand}<br/>
            ברקוד: {it.barcode} | משקל: {it.weight}<br/>
            מחיר יח׳: {it.unitPrice ?? "—"}₪
            {it.promoText && (
              <span style={{color:"green",marginInlineStart:6}}>
                (מבצע: {it.promoText})
              </span>
            )}
            <br/>
            {/* אזור עריכה */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              {chg && (
                <>
                  <span style={{
                    padding:"4px 10px",background:"#eee",
                    border:"1px solid #aaa",borderRadius:4,
                    minWidth:32,textAlign:"center"
                  }}>{it.amountInCart}</span>
                  <span style={{fontSize:20}}>→</span>
                </>
              )}

              <button onClick={()=>setDraft(it.barcode,Math.max(1,d-1))}>➖</button>
              <input
                type="number" min={1} value={d}
                onChange={(e)=>{
                  const v=parseInt(e.target.value,10);
                  if(!isNaN(v)&&v>=1) setDraft(it.barcode,v);
                }}
                style={{
                  width:60,textAlign:"center",
                  border: chg ? "2px solid #673ab7" : undefined
                }}
              />
              <button onClick={()=>setDraft(it.barcode,d+1)}>➕</button>

              <button
                disabled={!chg}
                onClick={()=>{
                  update(it.barcode,d);
                  clearDraft(it.barcode);
                }}
                style={{marginInlineStart:4}}
              >
                עדכן
              </button>
              <button onClick={()=>remove(it.barcode)}>מחק</button>
            </div>

            {/* totals per item */}
            <div style={{marginTop:4}}>
              סה״כ למוצר:&nbsp;
              {chg
                ? (<><strong>{neu.toFixed(2)}₪</strong> &rarr; {cur.toFixed(2)}₪</>)
                : (<>{cur.toFixed(2)}₪</>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartTest;