/* ProductCardList.js */
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import { convertWeightUnit } from "./ProductsList";
import "./ProductCardList.css";

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
  return products.map((product) => (
    <div className="list__product-card" key={product.barcode}>
      {product.discount && <div className="list__product-badge">מבצע</div>}

      <div className="list__product-details">
        <div className="list__product-data">
          <div className="list__product-name">
            <p>{truncate(product.name)}</p>
          </div>

          <div className="list__product-info">
            <div className="list__product-weight">
              <p>{product.weight}</p>
              <p>{convertWeightUnit(product.unitWeight)}</p>
            </div>
            <div className="list__separator">|</div>
            <div className="list__product-brand">
              <p>{product.brand}</p>
            </div>
          </div>

          <div className="list__product-price">
            {typeof product.unitPrice === "number" ? (
              <>
                <p>{priceFormat(product.unitPrice)}</p>
                <p style={{ fontSize: "1.4rem" }}>₪</p>
              </>
            ) : (
              <p>מחיר לא זמין בסופר</p>
            )}
          </div>

          {product.discount && discountPriceFormat(product.discount)}
        </div>

        <div
          className="list__product-image"
          onClick={() => moveToPriceList(product.barcode)}
        >
          <Image barcode={product.barcode} />
        </div>
      </div>

      <div className="list__product-operations">
        <div
          id={`add-to-cart-${product.barcode}`}
          className="list__product-operations__confirm"
          onClick={(e) => {
            e.stopPropagation();
            updateAmount(product.barcode);
          }}
        >
          אין שינוי
        </div>

        <div
          className="list__product-operations__add"
          onClick={(e) => {
            e.stopPropagation();
            incrementAmount(product.barcode);
          }}
        >
          +
        </div>

        <div className="list__product-operations__quantity">
          <span>{productAmounts[product.barcode] || 0}</span>
        </div>

        <div
          className="list__product-operations__reduce"
          onClick={(e) => {
            e.stopPropagation();
            decrementAmount(product.barcode);
          }}
        >
          -
        </div>

        <div>
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
  ));
}

export default ProductCardList;
