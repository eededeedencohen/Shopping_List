import React from "react";
// import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";
import {
  useSettings,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";
import "./ProductsGeneralSettings.css";

const ProductsGeneralSettings = () => {
  // const {
  //   canReplaceSettings, // value of "bySelect", "all", "none"
  //   canRoundUpSettings, // value of "bySelect", "all", "none"
  //   changeCanReplaceSettings,
  //   changeCanRoundUpSettings,
  //   changeCanReplaceAll,
  //   changeCanRoundUpAll,
  // } = useCartOptimizationContext();

  const { canReplaceSettings, canRoundUpSettings } = useSettings(); // useSettings
  const {
    changeCanReplaceSettings,
    changeCanRoundUpSettings,
    changeCanReplaceAll,
    changeCanRoundUpAll,
  } = useSettingsOperations();

  console.log("canReplaceSettings:", canReplaceSettings);
  console.log("canRoundUpSettings:", canRoundUpSettings);

  const onClickCanReplaceAll = () => {
    changeCanReplaceAll(true);
    changeCanReplaceSettings("all");
  };

  const onClickCanReplaceNone = () => {
    changeCanReplaceAll(false);
    changeCanReplaceSettings("none");
  };

  const onClickCanRoundUpAll = () => {
    changeCanRoundUpAll(true);
    changeCanRoundUpSettings("all");
  };

  const onClickCanRoundUpNone = () => {
    changeCanRoundUpAll(false);
    changeCanRoundUpSettings("none");
  };

  const onClickCanReplaceBySelect = () => {
    changeCanReplaceSettings("bySelect");
  };

  const onClickCanRoundUpBySelect = () => {
    changeCanRoundUpSettings("bySelect");
  };

  return (
    <div className="products-general-settings">
      <div className="can-replace-general-settings">
        <div
          className={`all-products ${
            canReplaceSettings === "all" ? "active" : ""
          }`}
          onClick={onClickCanReplaceAll}
        >
          עם החלפה אוטומטית של מוצרים
        </div>
        <div
          className={`some-products ${
            canReplaceSettings === "bySelect" ? "active" : ""
          }`}
          onClick={onClickCanReplaceBySelect}
        >
          עם החלפה אוטומטית של מוצרים שנבחרו
        </div>
        <div
          className={`no-products ${
            canReplaceSettings === "none" ? "active" : ""
          }`}
          onClick={onClickCanReplaceNone}
        >
          ללא החלפה אוטומטית של מוצרים
        </div>
      </div>
      <div className="can-round-up-general-settings">
        <div
          className={`all-products ${
            canRoundUpSettings === "all" ? "active" : ""
          }`}
          onClick={onClickCanRoundUpAll}
        >
          עם העגלת כמות של כל מוצר שבמבצע
        </div>
        <div
          className={`some-products ${
            canRoundUpSettings === "bySelect" ? "active" : ""
          }`}
          onClick={onClickCanRoundUpBySelect}
        >
          עם העגלת כמות של מוצרים שנבחרו
        </div>
        <div
          className={`no-products ${
            canRoundUpSettings === "none" ? "active" : ""
          }`}
          onClick={onClickCanRoundUpNone}
        >
          ללא העגלת כמות של מוצרים
        </div>
      </div>
      <button className="temp-button">Temp Button</button>
    </div>
  );
};

export default ProductsGeneralSettings;
