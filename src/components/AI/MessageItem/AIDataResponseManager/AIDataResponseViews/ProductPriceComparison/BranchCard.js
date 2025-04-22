import React from "react";
import SupermarketImage from "../../../../../Images/SupermarketImage";
import "./BranchCard.css";

const BranchCard = ({ branchAddress, city, price, supermarketName }) => {
  const hasDiscount = price?.hasDiscount && price.discount;

  return (
    <div className="b1_branch_card">
      <div className="b1_branch_left">
        <span className="b1_branch_base_price">₪{price.price.toFixed(2)}</span>

        <div className="b1_branch_discount_container">
          {hasDiscount ? (
            <div className="b1_branch_discount_box">
              <span className="b1_branch_discount_units">
                {price.discount.units} יחידות
              </span>
              <span className="b1_branch_discount_total">
                ב־₪{price.discount.totalPrice.toFixed(2)}
              </span>
              <span className="b1_branch_discount_per">
                ₪{price.discount.priceForUnit.toFixed(2)} ליחידה
              </span>
            </div>
          ) : (
            <div className="b1_branch_discount_placeholder" />
          )}
        </div>
      </div>

      <div className="b1_branch_right">
        <div className="b1_branch_logo_wrapper">
          <SupermarketImage
            supermarketName={supermarketName}
            className="b1_branch_logo_img"
          />
        </div>
        <span className="b1_branch_address">
          {branchAddress}, {city}
        </span>
      </div>
    </div>
  );
};

export default BranchCard;