import React from "react";
import "./SupermarketDetails.css";
import SupermarketLogo from "../../../../components/Images/SupermarketImage";

const SupermarketDetails = ({ supermarketDetails, totals }) => {
  const {
    name: supermarketName,
    address: supermarketAddress,
    city: supermarketCity,
  } = supermarketDetails || {};

  const showSavings = totals && totals.savings > 0;

  return (
    <section className="ocv-summary">
      <div className="ocv-summary-top">
        <div className="ocv-summary-logo-wrap">
          <SupermarketLogo
            supermarketName={supermarketName}
            className="ocv-summary-logo"
          />
        </div>
        <div className="ocv-summary-info">
          <h2 className="ocv-summary-name">{supermarketName}</h2>
          {(supermarketAddress || supermarketCity) && (
            <p className="ocv-summary-address">
              {supermarketAddress}
              {supermarketCity ? `, ${supermarketCity}` : ""}
            </p>
          )}
        </div>
      </div>

      {totals && (
        <div className="ocv-summary-stats">
          <div className="ocv-summary-stat">
            <span className="ocv-summary-stat-label">סה"כ עגלה</span>
            <span className="ocv-summary-stat-value">
              <span className="ocv-summary-stat-currency">₪</span>
              {totals.optimalTotal.toFixed(2)}
            </span>
          </div>

          {totals.originalTotal > 0 && (
            <div className="ocv-summary-stat">
              <span className="ocv-summary-stat-label">עגלה מקורית</span>
              <span className="ocv-summary-stat-value ocv-summary-stat-value--muted">
                <span className="ocv-summary-stat-currency">₪</span>
                {totals.originalTotal.toFixed(2)}
              </span>
            </div>
          )}

          {showSavings && (
            <div className="ocv-summary-stat ocv-summary-stat--savings">
              <span className="ocv-summary-stat-label">חיסכון</span>
              <span className="ocv-summary-stat-value">
                <span className="ocv-summary-stat-currency">₪</span>
                {totals.savings.toFixed(2)}
              </span>
            </div>
          )}

          <div className="ocv-summary-stat">
            <span className="ocv-summary-stat-label">פריטים</span>
            <span className="ocv-summary-stat-value">{totals.itemCount}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default SupermarketDetails;
