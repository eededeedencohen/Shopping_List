import React, { useState, useRef } from 'react';

const TouchDirection = () => {
  const [touchInfo, setTouchInfo] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    direction: ''
  });
  const startTouch = useRef({ x: 0, y: 0 });

  const handleTouchStart = (event) => {
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;

    startTouch.current = { x, y };
    setTouchInfo(prev => ({ ...prev, startX: x, startY: y }));
  };

  const handleTouchMove = (event) => {
    const moveX = event.touches[0].clientX;
    const moveY = event.touches[0].clientY;
    const deltaX = moveX - startTouch.current.x;
    const deltaY = moveY - startTouch.current.y;

    let direction = '';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal movement
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical movement
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setTouchInfo({
      startX: startTouch.current.x,
      startY: startTouch.current.y,
      endX: moveX,
      endY: moveY,
      direction: direction
    });
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ width: '100%', height: '100vh', backgroundColor: 'lightgray', textAlign: 'center', paddingTop: '50px' }}
    >
      Move your finger on this area
      <div>
        Start: ({touchInfo.startX.toFixed(2)}, {touchInfo.startY.toFixed(2)})<br />
        End: ({touchInfo.endX.toFixed(2)}, {touchInfo.endY.toFixed(2)})<br />
        Direction: {touchInfo.direction}
      </div>
    </div>
  );
};

export default TouchDirection;







