import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DOMAIN } from "../../constants";
import ReceiptProducts from "./ReceiptProducts";
import "./ImageParser.css";
import { IconArrowRight, IconClose } from "../Icons/UiIcons";

function ImageParser() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Wizard step: 'capture' | 'processing' | 'review' | 'saving' | 'done'
  const [step, setStep] = useState("capture");

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Parsed data state
  const [supermarket, setSupermarket] = useState({
    name: "",
    address: "",
    city: "",
  });
  const [date, setDate] = useState("");
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [consistency, setConsistency] = useState(null);

  // Error state
  const [error, setError] = useState(null);
  const [processingMessage, setProcessingMessage] = useState("");

  const handleImageSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    setStep("processing");
    setError(null);
    setProcessingMessage("מעלה תמונה ומנתח קבלה...");

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await axios.post(
        `${DOMAIN}/api/v1/history/parse-receipt`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = response.data.data;
      setSupermarket(data.supermarket);
      setDate(data.date);
      setProducts(data.products);
      setTotalPrice(data.totalPrice);
      setConsistency(data.consistency || null);
      setStep("review");
    } catch (err) {
      setError(err.response?.data?.message || "שגיאה בעיבוד הקבלה. נסה שוב.");
      setStep("capture");
    }
  };

  const handleSaveToHistory = async () => {
    setStep("saving");

    const historyData = {
      userID: "1",
      date: date || new Date().toISOString(),
      supermarketName: supermarket.name || "לא ידוע",
      supermarketAddress: supermarket.address || "",
      supermarketCity: supermarket.city || "",
      totalPrice: totalPrice,
      products: products.map((p) => ({
        barcode: p.barcode || "0000000",
        amount: p.amount || 1,
        name: p.name || "",
        brand: p.brand || "לא ידוע",
        totalPrice: p.totalPrice || 0,
        generalName: p.generalName || p.name || "",
        weight: p.weight || 0,
        unit: p.unit || "u",
        category: p.category || "Other",
        subcategory: p.subcategory || "Other",
        price: p.price || 0,
        hasDiscount: p.hasDiscount || false,
        /* prefer the REAL deal terms from the receipt ("מבצע N ב-Y") over
           derived values, so history records the promotion as printed */
        discount: p.hasDiscount
          ? {
              units: p.dealUnits || p.amount || 1,
              priceForUnit:
                p.dealUnits && p.dealTotal
                  ? Math.round((p.dealTotal / p.dealUnits) * 100) / 100
                  : p.totalPrice / (p.amount || 1),
              totalPrice: p.dealTotal || p.totalPrice || 0,
            }
          : { units: 0, priceForUnit: 0, totalPrice: 0 },
      })),
    };

    try {
      const res = await axios.post(`${DOMAIN}/api/v1/history`, historyData);
      setStep("done");
      setTimeout(() => {
        navigate(`/history/${res.data.data.history._id}`);
      }, 1500);
    } catch (err) {
      setError("שגיאה בשמירת הקבלה. נסה שוב.");
      setStep("review");
    }
  };

  const handleCancel = () => {
    setStep("capture");
    removeImage();
    setSupermarket({ name: "", address: "", city: "" });
    setDate("");
    setProducts([]);
    setTotalPrice(0);
    setError(null);
  };

  return (
    <div className="scanner-container">
      {/* Back Button */}
      <button className="scanner-back-btn" onClick={() => navigate(-1)}>
        <IconArrowRight />
      </button>

      <div className="scanner-title">סריקת קבלה להיסטוריה</div>

      {/* ── STEP: CAPTURE ── */}
      {step === "capture" && (
        <>
          <div className="scanner-capture-card">
            <div className="scanner-capture-icon">
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>

            <div className="scanner-capture-text">
              צלם או העלה תמונה של קבלה מהסופר
            </div>

            <div className="scanner-capture-buttons">
              {/* Camera Button */}
              <button
                className="scanner-capture-btn"
                onClick={() => cameraInputRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                צלם
              </button>

              {/* Upload Button */}
              <button
                className="scanner-capture-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                העלה תמונה
              </button>
            </div>

            {/* Hidden inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelected}
              className="scanner-hidden-input"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              className="scanner-hidden-input"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="scanner-preview-container">
              <img
                src={imagePreview}
                alt="תצוגה מקדימה"
                className="scanner-preview-image"
              />
              <button className="scanner-preview-remove" onClick={removeImage}>
                <IconClose />
              </button>
            </div>
          )}

          {/* Error */}
          {error && <div className="scanner-error">{error}</div>}

          {/* Analyze Button */}
          {imageFile && (
            <button className="scanner-analyze-btn" onClick={handleSubmit}>
              נתח קבלה
            </button>
          )}
        </>
      )}

      {/* ── STEP: PROCESSING ── */}
      {(step === "processing" || step === "saving") && (
        <div className="scanner-processing">
          <div className="scanner-processing-receipt" />
          <div className="scanner-processing-text">
            {step === "saving" ? "שומר להיסטוריה..." : processingMessage}
          </div>
          <div className="scanner-processing-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      {/* ── STEP: REVIEW ── */}
      {step === "review" && (
        <ReceiptProducts
          supermarket={supermarket}
          setSupermarket={setSupermarket}
          date={date}
          setDate={setDate}
          products={products}
          setProducts={setProducts}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          consistency={consistency}
          onConfirm={handleSaveToHistory}
          onCancel={handleCancel}
          error={error}
        />
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && (
        <div className="scanner-success">
          <div className="scanner-success-check">
            <svg viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="scanner-success-text">הקבלה נשמרה בהצלחה!</div>
        </div>
      )}
    </div>
  );
}

export default ImageParser;
