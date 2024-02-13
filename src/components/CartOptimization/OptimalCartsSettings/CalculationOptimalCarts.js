import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CalculationOptimalCarts.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";

const CalculationOptimalCarts = () => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { calculateOptimalsCarts } = useCartOptimizationContext();

  const startDragging = () => {
    setIsDragging(true);
  };

  const onDrag = (event) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      let newLeft = event.clientX - containerRect.left;

      // Constrain the position within the bounds of the container
      const minLeft = 0;
      const maxLeft = containerRect.width - 64; // 64 is the width of the swipe button
      newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

      setPosition(newLeft);
    }
  };

  const stopDragging = () => {
    setIsDragging(false);

    // Check if the swipe button is near the right side
    const threshold = containerRef.current.getBoundingClientRect().width - 64;
    if (position < threshold) {
      setPosition(0); // Reset position to left side with animation
    } else {
      console.log("Reached the right side");
      calculateOptimalsCarts();
      navigate("/optimal-supermarket-carts");
    }
  };

  const handleTouchMove = (event) => {
    if (isDragging && containerRef.current) {
      const touch = event.touches[0];
      onDrag({ clientX: touch.clientX });
    }
  };

  const handleTouchEnd = () => {
    stopDragging();
  };

  const calculateDivColor = () => {
    const maxPosition =
      containerRef.current?.getBoundingClientRect().width - 64 || 1;
    const intensity = Math.min(1, position / maxPosition);
    // Interpolating between a darker and a lighter color for the div
    const r = Math.round(46 + (255 - 46) * (intensity / 2));
    const g = Math.round(46 + (255 - 46) * (intensity / 2));
    const b = Math.round(46 + (255 - 46) * (intensity / 2));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div
      className="div"
      style={{ backgroundColor: calculateDivColor() }}
      ref={containerRef}
      onMouseMove={onDrag}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <span className="text">החלק לחישוב העגלות</span>
      <span
        className="swipe"
        style={{ left: `${position}px` }}
        onMouseDown={startDragging}
        onTouchStart={startDragging}
      ></span>
    </div>
  );
};

export default CalculationOptimalCarts;
