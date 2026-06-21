import React from "react";
import "./BottomNav.css";
import { ReactComponent as RobotIcon } from "../Toolbar/robot.svg";

/**
 * BottomNav — a slim blue bar (grid row 3 of the .App shell) with a robot
 * "coin" that peeks above the bar, nested in a transparent circular notch.
 *
 * Stable by design: the coin peeks above the BLUE bar but stays WITHIN the
 * nav row's reserved height (it never overflows into page content), and there
 * are NO infinite animations — those two things are what broke earlier.
 * The bar and the coin are SIBLINGS so the bar's notch mask doesn't clip it.
 */
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="סרגל תחתון">
      <div className="bottom-nav__bar" aria-hidden="true" />
      {/* Decorative only — no navigation yet. */}
      <button type="button" className="bottom-nav__btn" aria-label="רובוט">
        <RobotIcon className="bottom-nav__icon" aria-hidden="true" />
      </button>
    </nav>
  );
}
