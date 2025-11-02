import { useNavigate, useParams } from "react-router";
import { usePriceList } from "../../context/PriceContext";
import { Children, useEffect, useState } from "react";
import { Spin } from "antd";
import ProductsImages from "../Images/ProductsImages";
import SupermarketImage from "../Cart/supermarketImage";
import ProductComparisonModal from "./productComparisonModal";
import "./productComparison.css";

export default function ProductComparison() {
  const barcode = "7290019056096";

  const priceFormat = (price) => {
    return price.toFixed(2);
  };

  const unitWeightFormat = (unitWeight) => {
    if (unitWeight === "g") {
      return "גרם";
    }
    if (unitWeight === "kg") {
      return 'ק"ג';
    }
    if (unitWeight === "ml") {
      return 'מ"ל';
    }
    if (unitWeight === "l") {
      return "ליטר";
    }
    return unitWeight;
  };

  const nav = useNavigate();
  const { getPriceList } = usePriceList();

  const [priceList, setPriceList] = useState(undefined);
  const [product, setProduct] = useState(undefined);

  useEffect(() => {
    if (!barcode) {
      alert("Product not found"); // change this to a beautiful alert
      nav("/");
      return;
    }

    const fetchPriceList = async () => {
      const priceListResponse = await getPriceList(barcode);
      setProduct(priceListResponse.product);
      setPriceList(priceListResponse.prices);
    };

    fetchPriceList();
  }, [barcode, nav, getPriceList]);

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
    <div className="compareM__prices-container">
      <div className="compareM__product">
        <div className="compareM__product-name">
          <p>{product.name}</p>
        </div>
        <div className="compareM__product__image">
          <ProductsImages barcode={barcode} />
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

      <div className="compareM__prices-list">
        {Children.toArray(
          priceList.map((priceObject) => (
            <div className="compareM__supermarket-price-container">
              <div className="compareM__supermarket-name__image">
                <SupermarketImage
                  supermarketName={priceObject.supermarket.name}
                />
              </div>
              <div className="compareM__supermarket-address">
                <p>{priceObject.supermarket.address}</p>
                <p>{priceObject.supermarket.city}</p>
              </div>
              <div className="compareM__product-price">
                <div className="compareM__price-unit">
                  <p>{":מחיר"}</p>
                  <p
                    style={{
                      color: "#9c9c9c",
                      marginRight: "2rem",
                    }}
                  >
                    {priceFormat(priceObject.price)}
                  </p>
                  <p
                    style={{
                      color: "#9c9c9c",
                    }}
                  >
                    ₪
                  </p>
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
          ))
        )}
      </div>
    </div>
  );
}
