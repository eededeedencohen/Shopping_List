import React, { useState } from "react";
import { useCartOptimizationContext } from "../../context/cart-optimizationContext";
import {
  formatProductWeight,
  reverseFormatProductWeight,
} from "./WeightAccuracyHelpers";
import "./WeightAccuracy.css";

export default function WeightAccuracy({
  barcode,
  productWeight,
  productUnitWeight,
  currentWeightGain,
  currentWeightLoss,
}) {
  const { changeMaxWeightGain, changeMaxWeightLoss } =
    useCartOptimizationContext();
  const [tempWeightGain, setTempWeightGain] = useState(
    formatProductWeight(productWeight + currentWeightGain, productUnitWeight)
  );
  const [tempWeightLoss, setTempWeightLoss] = useState(
    formatProductWeight(productWeight - currentWeightLoss, productUnitWeight)
  );

  const handleWeightGainChange = (event) => {
    setTempWeightGain(event.target.value);
  };

  const handleWeightLossChange = (event) => {
    setTempWeightLoss(event.target.value);
  };

  const handleWeightGainMouseUp = () => {
    let newMaxWeightGain = reverseFormatProductWeight(
      tempWeightGain,
      productUnitWeight
    );
    changeMaxWeightGain(barcode, newMaxWeightGain - productWeight);
  };

  const handleWeightLossMouseUp = () => {
    let newMaxWeightLoss = reverseFormatProductWeight(
      tempWeightLoss,
      productUnitWeight
    );
    changeMaxWeightLoss(barcode, productWeight - newMaxWeightLoss);
  };

  return (
    <div className="product-settings__weight-accuracy">
      <div className="title">:טווח משקל של מוצר חלופי</div>
      <div className="weight-accuracy">
        <div className="max-weight-gain">
          <input
            type="range"
            step={5}
            min={formatProductWeight(productWeight, productUnitWeight)}
            max={formatProductWeight(productWeight, productUnitWeight) * 2} // TODO: find the product with the same generalName and get its weight
            defaultValue={tempWeightGain}
            onChange={handleWeightGainChange}
            onMouseUp={handleWeightGainMouseUp}
            onTouchEnd={handleWeightGainMouseUp}
            className="weight-gain-value"
          />
          <div className="weight-gain-display">{tempWeightGain}</div>
          <div className="unit-weight-gain">
            {productUnitWeight === "g" ? "גרם" : 'מ"ל'}
          </div>
        </div>
        <div className="max-weight-loss">
          <input
            type="range"
            step={5}
            min={0}
            max={formatProductWeight(productWeight, productUnitWeight)}
            defaultValue={tempWeightLoss}
            onChange={handleWeightLossChange}
            onMouseUp={handleWeightLossMouseUp}
            onTouchEnd={handleWeightLossMouseUp}
            className="weight-loss-value"
          />
          <div className="weight-loss-display">{tempWeightLoss}</div>
          <div className="unit-weight-loss">
            {productUnitWeight === "g" ? "גרם" : 'מ"ל'}
          </div>
        </div>
      </div>
    </div>
  );
}
