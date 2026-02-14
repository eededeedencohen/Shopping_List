/* ProductCardList.js */
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import { convertWeightUnit } from "./ProductsList";
import "./ProductCardList.css";
import plusIcon from "./plus.svg";
import minusIcon from "./minus.svg";

/* עיצוב מחיר */
const priceFormat = (price) =>
  typeof price !== "number" ? "—" : price.toFixed(2);

/* בלוק מחיר מבצע */
const discountPriceFormat = ({ units, totalPrice }) => (
  <div className="list__discount-price">
    <p style={{ marginLeft: "0.3rem" }}>{units}</p>
    <p>יחידות ב - </p>
    <p>{priceFormat(totalPrice)} ₪</p>
  </div>
);

/* חיתוך שם ארוך */
const truncate = (str, max = 23) =>
  !str ? "" : str.length > max ? "..." + str.substring(0, max - 3) : str;

/* ----------  רשימת כרטיסי מוצר --------------- */
function ProductCardList({
  products,
  selectedBarcode,
  groupData,
  moveToPriceList,
  productAmounts,
  oldProductAmounts,
  incrementAmount,
  decrementAmount,
  updateAmount,
  handleOpenBarcode,
  handleCloseBarcode,
  handleToggleAlternative,
}) {
  return products.map((product) => {
    const qty = productAmounts[product.barcode] || 0;

    return (
      <div className="list__product-card" key={product.barcode}>
        {product.discount && <div className="list__product-badge">מבצע</div>}

        {/* Col 1 (right in RTL): Image */}
        <div
          className="list__product-image"
          onClick={() => moveToPriceList(product.barcode)}
        >
          <ProductImageDisplay barcode={product.barcode} />
        </div>

        {/* Col 2 (center): Name + Meta + Price */}
        <div className="list__product-details">
          <span className="list__product-name">{truncate(product.name)}</span>
          <span className="list__product-meta">
            {product.brand} | {product.weight} {convertWeightUnit(product.unitWeight)}
          </span>
          <div className="list__product-price-row">
            <span className="list__product-units">{qty} יח'</span>
            {typeof product.unitPrice === "number" ? (
              <span className="list__product-price-value">
                {priceFormat(product.unitPrice)} ₪
              </span>
            ) : (
              <span className="list__product-price-value">מחיר לא זמין</span>
            )}
          </div>
          {product.discount && discountPriceFormat(product.discount)}
        </div>

        {/* Col 3 (left in RTL): +/- quantity */}
        <div className="list__product-quantity">
          <div
            className="list__btn-plus"
            onClick={(e) => { e.stopPropagation(); incrementAmount(product.barcode); }}
          >
            <img src={plusIcon} alt="+" />
          </div>
          <span className="list__qty-display">{qty}</span>
          <div
            className="list__btn-minus"
            onClick={(e) => { e.stopPropagation(); decrementAmount(product.barcode); }}
          >
            <img src={minusIcon} alt="-" />
          </div>
        </div>

        {/* Row 2: Actions */}
        <div className="list__product-actions">
          <div
            id={`add-to-cart-${product.barcode}`}
            className="list__btn-confirm"
            onClick={(e) => { e.stopPropagation(); updateAmount(product.barcode); }}
          >
            אין שינוי
          </div>

          <div className="list__product-group-btns">
            {selectedBarcode === product.barcode ? (
              <button
                onClick={() => handleCloseBarcode(product.barcode)}
                style={{ backgroundColor: "blue", color: "white" }}
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => handleOpenBarcode(product.barcode)}
                style={{ backgroundColor: "green", color: "white" }}
              >
                Open
              </button>
            )}

            {selectedBarcode && selectedBarcode !== product.barcode && (
              <button
                onClick={() => handleToggleAlternative(product.barcode)}
                style={{
                  backgroundColor: groupData[selectedBarcode]?.includes(
                    product.barcode,
                  )
                    ? "red"
                    : "green",
                  color: "white",
                }}
              >
                {groupData[selectedBarcode]?.includes(product.barcode)
                  ? "Remove"
                  : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });
}

export default ProductCardList;
