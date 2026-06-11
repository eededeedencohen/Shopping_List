import React, { useState } from "react";
import { useSettingsOperations } from "../../hooks/optimizationHooks";
import useVibrate from "../../hooks/useVibrate";
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
  const vibrate = useVibrate();
  const [tempWeightGain, setTempWeightGain] = useState(
    formatProductWeight(productWeight + currentWeightGain, productUnitWeight)
  );
  const [tempWeightLoss, setTempWeightLoss] = useState(
    formatProductWeight(productWeight - currentWeightLoss, productUnitWeight)
  );

  const baseWeight = formatProductWeight(productWeight, productUnitWeight);

  const handleWeightGainChange = (e) => {
    const next = Number(e.target.value);
    setTempWeightGain((prev) => {
      if (next !== prev) vibrate(10);
      return next;
    });
  };
  const handleWeightLossChange = (e) => {
    const next = Number(e.target.value);
    setTempWeightLoss((prev) => {
      if (next !== prev) vibrate(10);
      return next;
    });
  };

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

  // The track spans 0..(baseWeight * 2). Min input lives in the LEFT half
  // (0..baseWeight), max input in the RIGHT half (baseWeight..baseWeight*2).
  // Percentages used to position the colored "selected range" fills.
  const total = baseWeight * 2 || 1;
  const minPct = Math.max(0, Math.min(50, (tempWeightLoss / total) * 100));
  const maxPct = Math.max(50, Math.min(100, (tempWeightGain / total) * 100));

  return (
    <div className="wa-wrapper">
      <h4 className="wa-title">טווח משקל למוצר חלופי</h4>

      <div className="wa-rangerow">
        <div className="wa-rangerow-track">
          <div className="wa-rangerow-bg" />

          {/* selected range fills (red on the left of base, green on the right) */}
          <div
            className="wa-rangerow-fill wa-rangerow-fill--min"
            style={{ left: `${minPct}%`, width: `${50 - minPct}%` }}
          />
          <div
            className="wa-rangerow-fill wa-rangerow-fill--max"
            style={{ left: "50%", width: `${maxPct - 50}%` }}
          />

          {/* center anchor (base weight) */}
          <div className="wa-rangerow-anchor" />

          {/* min handle — left half of track */}
          <input
            type="range"
            min={0}
            max={baseWeight}
            step={5}
            value={tempWeightLoss}
            onChange={handleWeightLossChange}
            onMouseUp={handleWeightLossCommit}
            onTouchEnd={handleWeightLossCommit}
            onKeyUp={handleWeightLossCommit}
            className="wa-rangerow-input wa-rangerow-input--min"
            aria-label="משקל מינימלי"
          />

          {/* max handle — right half of track */}
          <input
            type="range"
            min={baseWeight}
            max={baseWeight * 2}
            step={5}
            value={tempWeightGain}
            onChange={handleWeightGainChange}
            onMouseUp={handleWeightGainCommit}
            onTouchEnd={handleWeightGainCommit}
            onKeyUp={handleWeightGainCommit}
            className="wa-rangerow-input wa-rangerow-input--max"
            aria-label="משקל מקסימלי"
          />
        </div>

        <div className="wa-rangerow-labels">
          <span className="wa-rangerow-label wa-rangerow-label--min">
            <span className="wa-rangerow-cap">מינ׳</span>
            <span className="wa-rangerow-value">{tempWeightLoss}</span>
            <span className="wa-rangerow-unit">{unit}</span>
          </span>
          <span className="wa-rangerow-label wa-rangerow-label--base">
            <span className="wa-rangerow-value">{baseWeight}</span>
            <span className="wa-rangerow-unit">{unit}</span>
          </span>
          <span className="wa-rangerow-label wa-rangerow-label--max">
            <span className="wa-rangerow-cap">עד</span>
            <span className="wa-rangerow-value">{tempWeightGain}</span>
            <span className="wa-rangerow-unit">{unit}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
