import React, { useState } from "react";
import { DOMAIN } from "../../constants";

function ServerProductImage({
  barcode,
  alt = "",
  className = "",
  style = {},
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !barcode) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100px",
          color: "#999",
        }}
      >
        <span>אין תמונה</span>
      </div>
    );
  }

  return (
    <img
      src={`${DOMAIN}/api/v1/product-images/${barcode}`}
      alt={alt || `Product ${barcode}`}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default ServerProductImage;
