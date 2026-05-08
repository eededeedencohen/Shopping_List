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
    let cancelled = false;

    // No alternative to fetch — mark loaded so the card moves on
    if (!isExistsInOptimalCart || !DetailsOptimalProduct.barcode) {
      setIsProductDetailsUpdated(true);
      return undefined;
    }

    // Reset loading state when the barcode changes
    setIsProductDetailsUpdated(false);

    Promise.resolve(getProductByBarcode(DetailsOptimalProduct.barcode))
      .then((res) => {
        if (cancelled) return;
        setProductDetails(res || {});
        setIsProductDetailsUpdated(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load alternative product:", err);
        setProductDetails({});
        setIsProductDetailsUpdated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isExistsInOptimalCart,
    DetailsOptimalProduct.barcode,
    getProductByBarcode,
  ]);

  if (!isProductDetailsUpdated) {
    return (
      <article className="opi-card opi-card--skeleton" aria-busy="true" aria-label="טוען פרטי מוצר חלופי">
        <header className="opi-header">
          <div className="opi-skel opi-skel-img" />
          <div className="opi-skel-info">
            <div className="opi-skel opi-skel-pill" />
            <div className="opi-skel opi-skel-line opi-skel-line--lg" />
            <div className="opi-skel opi-skel-line opi-skel-line--md" />
          </div>
        </header>
        <div className="opi-comparison">
          <div className="opi-skel opi-skel-side" />
          <div className="opi-skel opi-skel-side" />
        </div>
        <div className="opi-actions">
          <div className="opi-skel opi-skel-action" />
          <div className="opi-skel opi-skel-action" />
          <div className="opi-skel opi-skel-action" />
        </div>
      </article>
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

      <header className="opi-rp-header">
        <span className="opi-replaced-pill">
          <SwapIcon />
          הוחלף ב
        </span>

        {/* Alternative product (image + name + stats inline) */}
        <div className="opi-rp-block opi-rp-block--alt">
          <span className="opi-rp-tag opi-rp-tag--alt">החלופי</span>
          <div className="opi-rp-row">
            <div className="opi-rp-img">
              <ProductImageDisplay
                barcode={productDetails.barcode}
                className="opi-rp-img-el"
              />
            </div>
            <div className="opi-rp-info">
              <h3 className="opi-rp-name">{productDetails.name}</h3>
              {(productDetails.brand ||
                (productDetails.weight !== undefined &&
                  productDetails.weight !== "" &&
                  productDetails.weight !== 0)) && (
                <p className="opi-rp-meta">
                  {productDetails.brand && <span>{productDetails.brand}</span>}
                  {productDetails.weight !== undefined &&
                    productDetails.weight !== "" &&
                    productDetails.weight !== 0 && (
                      <span>
                        {productDetails.weight} {replacementUnitLabel}
                      </span>
                    )}
                </p>
              )}
              <div className="opi-rp-stats">
                <span className="opi-rp-stat">
                  {DetailsOptimalProduct.quantity}
                  <span className="opi-rp-stat-unit">יח׳</span>
                </span>
                <span className="opi-rp-stat opi-rp-stat--money">
                  ₪{DetailsOptimalProduct.totalPrice.toFixed(2)}
                </span>
                <span className="opi-rp-stat opi-rp-stat--small">
                  ₪{optimalUnitPrice}
                  <span className="opi-rp-stat-unit">/100{replacementUnitLabel}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="opi-rp-connector" aria-hidden="true">
          <span className="opi-rp-connector-line" />
          <span className="opi-rp-connector-label">במקום</span>
          <span className="opi-rp-connector-line" />
        </div>

        {/* Original product */}
        <div className="opi-rp-block opi-rp-block--orig">
          <span className="opi-rp-tag opi-rp-tag--orig">המקורי</span>
          <div className="opi-rp-row">
            <div className="opi-rp-img">
              <ProductImageDisplay
                barcode={original.barcode}
                className="opi-rp-img-el"
              />
            </div>
            <div className="opi-rp-info">
              <h3 className="opi-rp-name">{original.name}</h3>
              {(original.brand ||
                (original.weight !== undefined &&
                  original.weight !== "" &&
                  original.weight !== 0)) && (
                <p className="opi-rp-meta">
                  {original.brand && <span>{original.brand}</span>}
                  {original.weight !== undefined &&
                    original.weight !== "" &&
                    original.weight !== 0 && (
                      <span>
                        {original.weight}{" "}
                        {getConvertedUnitWeight(original.unitWeight)}
                      </span>
                    )}
                </p>
              )}
              {originalProductExists ? (
                <div className="opi-rp-stats">
                  <span className="opi-rp-stat">
                    {detailsOriginProduct.amount}
                    <span className="opi-rp-stat-unit">יח׳</span>
                  </span>
                  <span className="opi-rp-stat opi-rp-stat--money">
                    ₪{detailsOriginProduct.totalPrice.toFixed(2)}
                  </span>
                  <span className="opi-rp-stat opi-rp-stat--small">
                    ₪{originalUnitPrice}
                    <span className="opi-rp-stat-unit">
                      /100{getConvertedUnitWeight(original.unitWeight)}
                    </span>
                  </span>
                </div>
              ) : (
                <p className="opi-rp-not-existed">לא היה בעגלה המקורית</p>
              )}
            </div>
          </div>
        </div>
      </header>

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
