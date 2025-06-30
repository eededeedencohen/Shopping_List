import React from "react";
import "./CardHeader.css";
import SupermarketImage from "../../../../../../Images/SupermarketImage";

export default function CardHeader({ chainName }) {
  return (
    <SupermarketImage
      supermarketName={chainName}
      className="test_supermarketImage"
    />
  );
}
