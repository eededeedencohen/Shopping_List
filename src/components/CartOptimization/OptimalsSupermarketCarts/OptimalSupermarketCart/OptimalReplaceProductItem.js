import React, { useState, useEffect } from "react";
import { ProductImageDisplay } from "../../../Images/ProductImageService";
import EditOptimalProductModal from "./EditOptimalProduct/EditOptimalProductModal";
import EditOptimalProduct from "./EditOptimalProduct/EditOptimalProduct";
import EditAlternativeProduct from "./EditOptimalProduct/EditAlternativeProduct";
import "./OptimalProductItem.css";
import {
  getUnitWeightLabelForOne,
  getConvertedUnitWeight,
  isExistsInOriginalCart,
} from "./OptimalProductItemHelpers";
import { useOptimalCartsOperation } from "../../../../hooks/optimizationHooks";

const EditIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const SwapIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const TrashIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CheckCircleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const OptimalReplaceProductItem = ({
  detailsOriginProduct,
  DetailsOptimalProduct,
  isExistsInOptimalCart,
  supermarketID,
}) => {
  const [productDetails, setProductDetails] = useState({});
  const [isProductDetailsUpdated, setIsProductDetailsUpdated] = useState(false);
  const originalProductExists = isExistsInOriginalCart(detailsOriginProduct);
  const { getProductByBarcode, deleteProductFromOptimalCart } =
    useOptimalCartsOperation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  useEffect(() => {
    if (isExistsInOptimalCart) {
      getProductByBarcode(DetailsOptimalProduct.barcode).then((res) => {
        setProductDetails(res);
        setIsProductDetailsUpdated(true);
      });
    }
  }, [
    isExistsInOptimalCart,
    DetailsOptimalProduct.barcode,
    getProductByBarcode,
  ]);

  if (!isProductDetailsUpdated) {
    return (
      <div className="opi-card opi-card--loading">
        <div className="opi-loading-spinner" />
        <p className="opi-loading-text">טוען פרטי מוצר חלופי…</p>
      </div>
    );
  }

  const original = detailsOriginProduct.product;
  const replacementUnitLabel = getConvertedUnitWeight(productDetails.unitWeight);

  const optimalUnitPrice = getUnitWeightLabelForOne(
    DetailsOptimalProduct.totalPrice,
    DetailsOptimalProduct.quantity,
    productDetails.unitWeight,
    productDetails.weight
  );

  const originalUnitPrice = originalProductExists
    ? getUnitWeightLabelForOne(
        detailsOriginProduct.totalPrice,
        detailsOriginProduct.amount,
        original.unitWeight,
        original.weight
      )
    : null;

  const savings =
    originalProductExists
      ? detailsOriginProduct.totalPrice - DetailsOptimalProduct.totalPrice
      : 0;

  return (
    <article className={`opi-card is-replaced ${savings > 0 ? "is-saving" : ""}`}>
      <EditOptimalProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <EditOptimalProduct
          productDetails={detailsOriginProduct}
          optimalProductDetails={DetailsOptimalProduct}
          supermarketID={supermarketID}
          isReplace={true}
          replaceProductDetails={productDetails}
          closeModal={() => setIsModalOpen(false)}
        />
      </EditOptimalProductModal>

      <EditOptimalProductModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
      >
        <EditAlternativeProduct
          oldBarcode={DetailsOptimalProduct.barcode}
          generalName={original.generalName}
          supermarketID={supermarketID}
          DetailsOptimalProduct={DetailsOptimalProduct}
          quantity={DetailsOptimalProduct.quantity}
          isExistsInOptimalCart={isExistsInOptimalCart}
        />
      </EditOptimalProductModal>

      <header className="opi-header">
        <div className="opi-product-img">
          <ProductImageDisplay
            barcode={productDetails.barcode}
            className="opi-product-img-el"
          />
        </div>
        <div className="opi-product-info">
          <span className="opi-replaced-pill">
            <SwapIcon />
            הוחלף ב
          </span>
          <h3 className="opi-product-name">{productDetails.name}</h3>
          <p className="opi-product-meta">
            {productDetails.brand && <span>{productDetails.brand}</span>}
            {productDetails.weight !== undefined &&
              productDetails.weight !== "" &&
              productDetails.weight !== 0 && (
                <span>
                  {productDetails.weight} {replacementUnitLabel}
                </span>
              )}
          </p>
          <p className="opi-replaced-from">
            במקום: <strong>{original.name}</strong>
          </p>
        </div>
      </header>

      <div className="opi-comparison">
        <div className="opi-side opi-side--optimal">
          <span className="opi-side-header">המוצר החלופי</span>
          <div className="opi-side-rows">
            <div className="opi-row">
              <span className="opi-row-label">כמות</span>
              <span className="opi-row-value">
                {DetailsOptimalProduct.quantity}
              </span>
            </div>
            <div className="opi-row">
              <span className="opi-row-label">סה"כ</span>
              <span className="opi-row-value">
                ₪{DetailsOptimalProduct.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="opi-row">
              <span className="opi-row-label">ל-100 {replacementUnitLabel}</span>
              <span className="opi-row-value opi-row-value--small">
                ₪{optimalUnitPrice}
              </span>
            </div>
          </div>
        </div>

        {originalProductExists ? (
          <div className="opi-side opi-side--original">
            <span className="opi-side-header">המוצר המקורי</span>
            <div className="opi-side-rows">
              <div className="opi-row">
                <span className="opi-row-label">כמות</span>
                <span className="opi-row-value">
                  {detailsOriginProduct.amount}
                </span>
              </div>
              <div className="opi-row">
                <span className="opi-row-label">סה"כ</span>
                <span className="opi-row-value">
                  ₪{detailsOriginProduct.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="opi-row">
                <span className="opi-row-label">
                  ל-100 {getConvertedUnitWeight(original.unitWeight)}
                </span>
                <span className="opi-row-value opi-row-value--small">
                  ₪{originalUnitPrice}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="opi-side opi-side--inactive">
            <span className="opi-side-header">המוצר המקורי</span>
            <span className="opi-side-empty">לא היה בעגלה</span>
          </div>
        )}
      </div>

      {savings > 0 && (
        <div className="opi-savings-row">
          <CheckCircleIcon />
          <span>
            חוסכים <strong>₪{savings.toFixed(2)}</strong> לעומת המוצר המקורי
          </span>
        </div>
      )}

      <div className="opi-actions">
        <button
          type="button"
          className="opi-action opi-action--edit"
          onClick={() => setIsModalOpen(true)}
          aria-label="עריכה"
        >
          <EditIcon />
          <span>עריכה</span>
        </button>
        <button
          type="button"
          className="opi-action opi-action--swap"
          onClick={() => setIsModalOpen2(true)}
          aria-label="חלופי"
        >
          <SwapIcon />
          <span>חלופי</span>
        </button>
        <button
          type="button"
          className="opi-action opi-action--delete"
          onClick={() =>
            deleteProductFromOptimalCart(
              DetailsOptimalProduct.barcode,
              supermarketID
            )
          }
          aria-label="הסרה"
        >
          <TrashIcon />
          <span>הסר</span>
        </button>
      </div>
    </article>
  );
};

export default OptimalReplaceProductItem;
