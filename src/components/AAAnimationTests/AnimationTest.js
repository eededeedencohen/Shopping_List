import React, { useState } from "react";
import "./AnimationTest.css";

const AnimationTest = () => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 });
  const [diff, setDiff] = useState({ x: 0, y: 0 });

  const [currentObjMoving, setCurrentObjMoving] = useState(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };
    setTouchStart(pos);
    setTouchCurrent(pos);
    setDiff({ x: 0, y: 0 });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const current = { x: touch.clientX, y: touch.clientY };
    setTouchCurrent(current);
    setDiff({
      x: current.x - touchStart.x,
      y: current.y - touchStart.y,
    });
  };

  const handleOnTouchOBJ = (obj) => {
    setCurrentObjMoving(obj);
  };

  const handleOnTouchEnd = () => {
    const minDistance = 200;
    const distanceX = touchCurrent.x - touchStart.x;
    if (Math.abs(distanceX) > minDistance) {
      alert(
        `You swiped ${distanceX > 0 ? "right" : "left"} on ${currentObjMoving}`
      );
    }
    setCurrentObjMoving(null);
  };

  return (
    <>
      <div className="ac_scroll-wrapper">
        <div
          className="ac_container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div
            className={`ac_box`}
            onTouchStart={() => handleOnTouchOBJ("OBJ1")}
            onTouchEnd={() => handleOnTouchEnd()}
          >
            OBJ1
          </div>
          <div
            className={`ac_box`}
            onTouchStart={() => handleOnTouchOBJ("OBJ2")}
            onTouchEnd={() => handleOnTouchEnd()}
          >
            OBJ2
          </div>
          <div
            className={`ac_box`}
            onTouchStart={() => handleOnTouchOBJ("OBJ3")}
            onTouchEnd={() => handleOnTouchEnd()}
          >
            OBJ3
          </div>
          <div
            className={`ac_box`}
            onTouchStart={() => handleOnTouchOBJ("OBJ4")}
            onTouchEnd={() => handleOnTouchEnd()}
          >
            OBJ4
          </div>
        </div>
      </div>

      <div className="touch-output">
        <h3>Touch Tracking (Live)</h3>
        <p>
          Start X: {touchStart.x}px | Start Y: {touchStart.y}px
        </p>
        <p>
          Now X: {touchCurrent.x}px | Now Y: {touchCurrent.y}px
        </p>
        <p>
          ΔX: {diff.x}px | ΔY: {diff.y}px
        </p>
        <p>Swipe OBJ: {currentObjMoving ? currentObjMoving : "None"}</p>
        <p>
          Swipe Direction: {diff.x > 0 ? "Right" : diff.x < 0 ? "Left" : "None"}
        </p>
        <p>Swipe DisranceX: {Math.abs(diff.x)}px</p>
      </div>
    </>
  );
};

export default AnimationTest;
