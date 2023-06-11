import { useNavigate, useParams } from "react-router";
import { usePriceList } from "../../context/PriceContext";
import { Children, useEffect, useState } from "react";
import { Spin } from "antd";
import "./PriceList.css"; // Importing a CSS file for styling

export default function PriceList() {
  const { barcode } = useParams();

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

  /*
  example for priceObject:
      {
        "_id": "6470d83ada4a243eb0862529",
        "barcode": "7290107932080",
        "supermarket": {
            "supermarketID": 38,
            "name": "יש חסד",
            "address": "כנפי נשרים 24",
            "city": "ירושלים",
            "_id": "6470d83ada4a243eb086252a"
        },
        "price": 6.9,
        "hasDiscount": false,
        "discount": null,
        "__v": 0
    }
   */

    return (
      <div>
        <h1>Price list for product {product.name}</h1>
        {Children.toArray(
          priceList.map((priceObject) => (
            <div>
              <h5>{priceObject.price}</h5>
              <h5>{priceObject.supermarket.name}</h5>
              <h5>{priceObject.supermarket.address}</h5>
              <h5>{priceObject.supermarket.city}</h5>
              <hr/>
            </div>
          ))
        )}
      </div>
    );
  }
