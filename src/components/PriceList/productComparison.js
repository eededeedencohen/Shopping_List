import { useEffect, useState, Children } from "react";
import { Spin } from "antd";
import { usePriceList } from "../../context/PriceContext";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
// import "./PriceListNew.css";
// import "./PriceList.css";
import "./productComparison.css";

export default function ProductComparison({ barcode }) {
  const { getPriceList } = usePriceList();
  const [priceList, setPriceList] = useState(undefined);
  const [product, setProduct] = useState(undefined);

  const priceFormat = (price) => price.toFixed(2);

  const unitWeightFormat = (unitWeight) => {
    switch (unitWeight) {
      case "g":
        return "גרם";
      case "kg":
        return 'ק"ג';
      case "ml":
        return 'מ"ל';
      case "l":
        return "ליטר";
      default:
        return unitWeight;
    }
  };

  useEffect(() => {
    if (!barcode) return;

    const fetchPriceList = async () => {
      const response = await getPriceList(barcode);
      setProduct(response.product);
      setPriceList(response.prices);
    };

    fetchPriceList();
  }, [barcode, getPriceList]);

  if (!priceList || !product) {
    return (
      <div className="spinner-container">
        <Spin size="large">
          <></>
        </Spin>
      </div>
    );
  }

  return (
    <div className="compareM-prices-container">
      {/* Product info */}
      <div className="compareM__product">
        <div className="compareM__product-name">
          <p>{product.name}</p>
        </div>
        <div className="compareM__product__image-container">
          <ProductImageDisplay
            barcode={barcode}
            className="compareM__product__image"
          />
        </div>

        <div className="compareM__details_label">
          <p>:נתונים</p>
        </div>
        <div className="compareM__line" />

        <div className="compareM__product-weight">
          <p style={{ marginLeft: "0.5rem" }}>{":משקל"}</p>
          <p style={{ marginLeft: "0.5rem", fontWeight: "bold" }}>
            {product.weight}
          </p>
          <p style={{ fontWeight: "bold" }}>
            {unitWeightFormat(product.unitWeight)}
          </p>
        </div>
        <div className="compareM__line" />

        <div className="compareM__product-brand">
          <p style={{ marginLeft: "0.5rem" }}>{":חברה/מותג"}</p>
          <p style={{ fontWeight: "bold" }}>{product.brand}</p>
        </div>
        <div className="compareM__line" />

        <div className="compareM__product-barcode">
          <p style={{ marginLeft: "0.5rem" }}>{":ברקוד"}</p>
          <p style={{ fontWeight: "bold" }}>{product.barcode}</p>
        </div>
        <div className="compareM__line" style={{ marginBottom: "1rem" }} />
      </div>

      {/* Prices list */}
      <div className="compareM__prices-list">
        {Children.toArray(
          priceList.map((priceObject) => (
            <div className="compareM__supermarket-price-container">
              <div className="compareM__supermarket-details">
                <div className="compareM__supermarket-name__image">
                  <SupermarketImage
                    supermarketName={priceObject.supermarket.name}
                  />
                </div>

                <div className="compareM__supermarket-address">
                  {priceObject.supermarket.address?.includes("https") ? (
                    <p>{priceObject.supermarket.name}</p>
                  ) : (
                    <>
                      <p>{priceObject.supermarket.address}</p>
                      <p>{priceObject.supermarket.city}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="compareM__product-price">
                <div className="compareM__price-unit">
                  <p>{":מחיר"}</p>
                  <p style={{ color: "#9c9c9c" }}>
                    {priceFormat(priceObject.price)}
                  </p>
                  <p style={{ color: "#9c9c9c" }}>₪</p>
                </div>

                {priceObject.discount && (
                  <div className="compareM__price-sale">
                    <div className="compareM__price-sale_details">
                      <p>{priceObject.discount.units}</p>
                      <p style={{ marginRight: "3px" }}>{"יחידות ב"}</p>
                      <p>{" - "}</p>
                      <p>{priceFormat(priceObject.discount.totalPrice)}</p>
                      <p style={{ marginRight: "3px" }}>{"₪"}</p>
                    </div>
                    <div className="compareM__price-sale_unit-price">
                      <p>{")"}</p>
                      <p>{priceFormat(priceObject.discount.priceForUnit)}</p>
                      <p>{"₪"}</p>
                      <p style={{ marginRight: "4px" }}>{"ליחידה"}</p>
                      <p>{"("}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )),
        )}
      </div>
    </div>
  );
}
