import React, { useState, useEffect, useRef } from "react";
import { DOMAIN } from "../../constants";
import "./AI.css";
import MessageItem from "./MessageItem/MessageItem";
import NeuronBackground from "./NeuronBackground";
import Brobot from "../Brobot/Brobot";

const AI = () => {
  /* ------------------------------------------------------------------ */
  /*  state & refs                                                      */
  /* ------------------------------------------------------------------ */
  const [messages, setMessages] = useState([
    {
      text: "זאת הודעה מהבינה מלאכותית",
      sender: "assistant",
      type: "regular",
      data: null,
    },
    { text: "זה הודעה מהמשתמש", sender: "user", type: "regular", data: null },
    {
      text: "כאן אמור להיות טעינה",
      sender: "loading",
      type: "loading",
      data: null,
    },
    {
      text: "הנה לך ההוצאות שלך לפי חודש",
      sender: "assistant",
      type: "operation",
      data: null,
    },
    {
      text: "הנה לך ההוצאות שלך לפי חודש",
      sender: "operation",
      type: "cartOperation",
      data: null,
      action: {
        barcode: "7290108350616",
        operationType: "delete",
        newQuantity: 0,
      },
    },
    {
      text: "הנה לך ההוצאות שלך לפי חודש",
      sender: "operation",
      type: "monthlyExpenses",
      data: {
        "2025-01": 89.3,
        "2025-02": 200.2,
        "2025-05": 1968.4,
        "2025-06": 1579.5,
      },
    },
  ]);

  const [textInput, setTextInput] = useState("");
  const brobotRef = useRef(null);
  const messageEndRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /*  auto-scroll                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (
    text,
    sender,
    type = "regular",
    data = null,
    action = []
  ) => setMessages((prev) => [...prev, { text, sender, type, data, action }]);

  const removeLoadingMessage = () =>
    setMessages((prev) => prev.filter((m) => m.type !== "loading"));

  /* ------------------------------------------------------------------ */
  /*  util: load voices (once)                                          */
  /* ------------------------------------------------------------------ */
  function getVoices() {
    return new Promise((resolve) => {
      const already = speechSynthesis.getVoices();
      if (already.length) return resolve(already);
      speechSynthesis.onvoiceschanged = () =>
        resolve(speechSynthesis.getVoices());
    });
  }

  /* ------------------------------------------------------------------ */
  /*  1. handleOnSubmit – שליחת הודעה                                   */
  /* ------------------------------------------------------------------ */
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    /* 1) הודעת משתמש במסך */
    const userText = textInput.trim();
    addMessage(userText, "user");
    setTextInput("");

    /* 2) הודעת טעינה (נעלמת בהמשך) */
    addMessage("… טוען תשובה", "loading", "loading");

    let boundaryTimer = null;

    try {
      /* 3) קריאה ל-API שלכם */
      const res = await fetch(`${DOMAIN}/api/v1/ai/ai-response-v4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });

      /* 4) מסירים את הודעת הטעינה */
      removeLoadingMessage();

      /* 5) עיבוד תשובת השרת */
      const json = await res.json();
      const aiResp = json.aiResponse ?? {};
      const messageToUser = aiResp.messageToUser ?? "";
      const messageType = aiResp.messageType ?? "regular";
      const action = aiResp.actions ?? {};
      const data = aiResp.data ?? {};
      const sender = messageType === "regular" ? "assistant" : "operation";

      addMessage(messageToUser, sender, messageType, data, action);

      /* 6) TTS + סנכרון ברובוט */
      if (messageToUser) {
        const utter = new SpeechSynthesisUtterance(messageToUser);
        utter.lang = "he-IL";
        utter.rate = 1;

        const voices = await getVoices();
        const hebVoices = voices.filter((v) => v.lang === "he-IL");
        utter.voice = hebVoices[0] ?? voices[0];

        utter.onstart = () => brobotRef.current?.talkStart();
        utter.onresume = () => brobotRef.current?.talkStart();
        utter.onpause = () => brobotRef.current?.talkStop();
        utter.onend = () => {
          clearTimeout(boundaryTimer);
          brobotRef.current?.talkStop();
        };
        utter.onboundary = (ev) => {
          if (ev.name === "word") {
            brobotRef.current?.talkStart();
            clearTimeout(boundaryTimer);
            boundaryTimer = setTimeout(
              () => brobotRef.current?.talkStop(),
              250
            );
          }
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
      }
    } catch (err) {
      console.error(err);
      removeLoadingMessage();
      addMessage("⚠️ ארעה שגיאה. נסה שוב.", "assistant");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  reset conversation                                                */
  /* ------------------------------------------------------------------ */
  const handleReset = async () => {
    setMessages((prev) => prev.slice(0, 4)); // שומר את 4 ההודעות הראשונות
    setTextInput("");
    await fetch(`${DOMAIN}/api/v1/ai/reset`, { method: "POST" });
  };

  /* ------------------------------------------------------------------ */
  /*  render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="ai-container">
      <NeuronBackground />
      <Brobot ref={brobotRef} />

      {/* ---------- הודעות ---------- */}
      <div className="messages-container">
        {messages.map((m, i) => (
          <MessageItem
            key={i}
            message={m.text}
            sender={m.sender}
            type={m.type}
            data={m.data}
            action={m.action}
          />
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* ---------- קלט משתמש ---------- */}
      <div className="user-text-box">
        <form onSubmit={handleOnSubmit}>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="...הקלד הודעה"
            dir="auto"
            onFocus={() => brobotRef.current?.look("down")}
            onBlur={() => brobotRef.current?.look("center")}
          />
          <button type="submit">שלח</button>
          <button type="button" onClick={handleReset}>
            אפס
          </button>
        </form>
      </div>
    </div>
  );
};

export default AI;

// const b1Data = {
//   "רמי לוי": [
//     {
//       branchName: "רמי לוי",
//       branchAddress: "האומן,15",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "יד חרוצים 18",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18be1",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a43",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21b21",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21bfd",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "דרך החורש 90",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18be4",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a46",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "הפרסה 3",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18be7",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a49",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21b24",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21c00",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "איזור התעשיה שער בנימין",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18bea",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a4c",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21b27",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21c03",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "בית הדפוס 13",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18bed",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a4f",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21b2a",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21c06",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "כנפי נשרים 26",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18bf0",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a52",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21b2d",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21c09",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//     {
//       branchName: "רמי לוי",
//       branchAddress: "איזור תעשיה עטרות",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714a",
//             name: "דוריטוס חריף אש",
//             hasUiqueBarcode: true,
//             barcode: "7290010117864",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714a",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341eac07fd56234a18bf3",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714d",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290100850916",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714d",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21a55",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f7148",
//             name: "דוריטוס גריל",
//             hasUiqueBarcode: true,
//             barcode: "7290100850923",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f7148",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21b30",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714b",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290100850930",
//             brand: "דוריטוס",
//             weight: 70,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714b",
//           },
//           price: {
//             price: 3.9,
//             hasDiscount: true,
//             discount: {
//               units: 6,
//               priceForUnit: 3.33,
//               totalPrice: 20,
//               _id: "67b341ebc07fd56234a21c0c",
//             },
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.5,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//   ],
//   "שפע ברכת השם": [
//     {
//       branchName: "שפע ברכת השם",
//       branchAddress: "האומן 14",
//       products: [
//         {
//           product: {
//             _id: "646db90aadbba146043f714f",
//             name: "דוריטוס טבעי",
//             hasUiqueBarcode: true,
//             barcode: "7290106528628",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714f",
//           },
//           price: {
//             price: 8.6,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//         {
//           product: {
//             _id: "646db90aadbba146043f714e",
//             name: "דוריטוס חמוץ חריף",
//             hasUiqueBarcode: true,
//             barcode: "7290106667266",
//             brand: "דוריטוס",
//             weight: 185,
//             unitWeight: "g",
//             generalName: "דוריטוס",
//             __v: 0,
//             category: "חטיפים ודגנים",
//             subcategory: "חטיפים מלוחים",
//             id: "646db90aadbba146043f714e",
//           },
//           price: {
//             price: 8.6,
//             hasDiscount: false,
//             discount: null,
//           },
//         },
//       ],
//     },
//   ],
// };
