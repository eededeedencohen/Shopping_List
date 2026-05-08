import React, { useState } from "react";
import { useSettingsOperations } from "../../hooks/optimizationHooks";
import {
  formatProductWeight,
  reverseFormatProductWeight,
} from "./WeightAccuracyHelpers";
import "./WeightAccuracy.css";

const unitLabel = (unit) => {
  if (unit === "g" || unit === "kg") return "גרם";
  if (unit === "ml" || unit === "l") return 'מ"ל';
  return unit || "";
};

export default function WeightAccuracy({
  barcode,
  productWeight,
  productUnitWeight,
  currentWeightGain,
  currentWeightLoss,
}) {
  const { changeMaxWeightGain, changeMaxWeightLoss } = useSettingsOperations();
  const [tempWeightGain, setTempWeightGain] = useState(
    formatProductWeight(productWeight + currentWeightGain, productUnitWeight)
  );
  const [tempWeightLoss, setTempWeightLoss] = useState(
    formatProductWeight(productWeight - currentWeightLoss, productUnitWeight)
  );

  const baseWeight = formatProductWeight(productWeight, productUnitWeight);

  const handleWeightGainChange = (e) => setTempWeightGain(Number(e.target.value));
  const handleWeightLossChange = (e) => setTempWeightLoss(Number(e.target.value));

  const handleWeightGainCommit = () => {
    const newMaxWeightGain = reverseFormatProductWeight(
      tempWeightGain,
      productUnitWeight
    );
    changeMaxWeightGain(barcode, newMaxWeightGain - productWeight);
  };

  const handleWeightLossCommit = () => {
    const newMaxWeightLoss = reverseFormatProductWeight(
      tempWeightLoss,
      productUnitWeight
    );
    changeMaxWeightLoss(barcode, productWeight - newMaxWeightLoss);
  };

  const unit = unitLabel(productUnitWeight);

  return (
    <div className="wa-wrapper">
      <h4 className="wa-title">טווח משקל למוצר חלופי</h4>

      <div className="wa-slider wa-slider--up">
        <div className="wa-row">
          <span className="wa-cap">עד</span>
          <span className="wa-val">{tempWeightGain}</span>
          <span className="wa-unit">{unit}</span>
        </div>
        <input
          type="range"
          step={5}
          min={baseWeight}
          max={baseWeight * 2}
          defaultValue={tempWeightGain}
          onChange={handleWeightGainChange}
          onMouseUp={handleWeightGainCommit}
          onTouchEnd={handleWeightGainCommit}
          className="wa-range wa-range--up"
        />
      </div>

      <div className="wa-slider wa-slider--down">
        <div className="wa-row">
          <span className="wa-cap">מינימום</span>
          <span className="wa-val">{tempWeightLoss}</span>
          <span className="wa-unit">{unit}</span>
        </div>
        <input
          type="range"
          step={5}
          min={0}
          max={baseWeight}
          defaultValue={tempWeightLoss}
          onChange={handleWeightLossChange}
          onMouseUp={handleWeightLossCommit}
          onTouchEnd={handleWeightLossCommit}
          className="wa-range wa-range--down"
        />
      </div>
    </div>
  );
}
