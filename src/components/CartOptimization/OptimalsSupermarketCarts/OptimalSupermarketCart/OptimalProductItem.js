import React, { useState } from "react";
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
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const SwapIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const TrashIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const WarningIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const OptimalProductItem = ({
  detailsOriginProduct,
  DetailsOptimalProduct,
  isExistsInOptimalCart,
  supermarketID,
}) => {
  const { deleteProductFromOptimalCart } = useOptimalCartsOperation();
  const originalProductExists = isExistsInOriginalCart(detailsOriginProduct);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const product = detailsOriginProduct.product;
  const unitLabel = getConvertedUnitWeight(product.unitWeight);

  const optimalUnitPrice = isExistsInOptimalCart
    ? getUnitWeightLabelForOne(
        DetailsOptimalProduct.totalPrice,
        DetailsOptimalProduct.quantity,
        product.unitWeight,
        product.weight
      )
    : null;

  const originalUnitPrice = originalProductExists
    ? getUnitWeightLabelForOne(
        detailsOriginProduct.totalPrice,
        detailsOriginProduct.amount,
        product.unitWeight,
        product.weight
      )
    : null;

  const savings =
    isExistsInOptimalCart && originalProductExists
      ? detailsOriginProduct.totalPrice - DetailsOptimalProduct.totalPrice
      : 0;

  return (
    <article
      className={`opi-card ${
        isExistsInOptimalCart ? "" : "is-missing"
      } ${savings > 0 ? "is-saving" : ""}`}
    >
      <EditOptimalProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <EditOptimalProduct
          productDetails={detailsOriginProduct}
          optimalProductDetails={DetailsOptimalProduct}
          supermarketID={supermarketID}
          isReplace={false}
          replaceProductDetails={null}
          closeModal={() => setIsModalOpen(false)}
        />
      </EditOptimalProductModal>

      <EditOptimalProductModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
      >
        <EditAlternativeProduct
          oldBarcode={DetailsOptimalProduct.barcode}
          generalName={product.generalName}
          supermarketID={supermarketID}
          DetailsOptimalProduct={DetailsOptimalProduct}
          quantity={DetailsOptimalProduct.quantity}
          isExistsInOptimalCart={isExistsInOptimalCart}
        />
      </EditOptimalProductModal>

      <header className="opi-header">
        <div className="opi-product-img">
          <ProductImageDisplay
            barcode={DetailsOptimalProduct.barcode}
            className="opi-product-img-el"
          />
        </div>
        <div className="opi-product-info">
          <h3 className="opi-product-name">{product.name}</h3>
          <p className="opi-product-meta">
            {product.brand && <span>{product.brand}</span>}
            {product.weight !== undefined && product.weight !== "" && product.weight !== 0 && (
              <span>
                {product.weight} {unitLabel}
              </span>
            )}
          </p>
        </div>
      </header>

      {isExistsInOptimalCart ? (
        <div className="opi-stats">
          <div className="opi-stat-row opi-stat-row--optimal">
            <span className="opi-stat-row-label">בסופר זה</span>
            <div className="opi-stat-row-cells">
              <span className="opi-rp-stat">
                {DetailsOptimalProduct.quantity}
                <span className="opi-rp-stat-unit">יח׳</span>
              </span>
              <span className="opi-rp-stat opi-rp-stat--money">
                ₪{DetailsOptimalProduct.totalPrice.toFixed(2)}
              </span>
              <span className="opi-rp-stat opi-rp-stat--small">
                ₪{optimalUnitPrice}
                <span className="opi-rp-stat-unit">/100{unitLabel}</span>
              </span>
            </div>
          </div>

          {originalProductExists ? (
            <div className="opi-stat-row opi-stat-row--original">
              <span className="opi-stat-row-label">בעגלה המקורית</span>
              <div className="opi-stat-row-cells">
                <span className="opi-rp-stat">
                  {detailsOriginProduct.amount}
                  <span className="opi-rp-stat-unit">יח׳</span>
                </span>
                <span className="opi-rp-stat opi-rp-stat--money">
                  ₪{detailsOriginProduct.totalPrice.toFixed(2)}
                </span>
                <span className="opi-rp-stat opi-rp-stat--small">
                  ₪{originalUnitPrice}
                  <span className="opi-rp-stat-unit">/100{unitLabel}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="opi-stat-row opi-stat-row--inactive">
              <span className="opi-stat-row-label">בעגלה המקורית</span>
              <span className="opi-stat-row-empty">לא היה בעגלה</span>
            </div>
          )}
        </div>
      ) : (
        <div className="opi-missing-banner">
          <WarningIcon />
          <span>המוצר לא זמין בסופר זה</span>
        </div>
      )}

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

export default OptimalProductItem;
