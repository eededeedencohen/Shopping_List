import React, { useMemo, useRef, useEffect, useState } from "react";
import "./MonthlyExpensesChart.css";

/* ------------------------------------------------------------------ */
/*  Catmull-Rom → Cubic-Bezier path                                   */
/*  - Smooth curve that passes through every point                    */
/*  - Falls back to straight line when only two points exist          */
/* ------------------------------------------------------------------ */
const buildSmoothPath = (points /* [{x,y},…] */) => {
  if (points.length < 2) return "";

  // exactly two points → straight segment
  if (points.length === 2) {
    const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = points;
    return `M ${x0} ${y0} L ${x1} ${y1}`;
  }

  // 3+ points → Catmull-Rom spline
  const segments = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1X = p1.x + (p2.x - p0.x) / 6;
    const cp1Y = p1.y + (p2.y - p0.y) / 6;
    const cp2X = p2.x - (p3.x - p1.x) / 6;
    const cp2Y = p2.y - (p3.y - p1.y) / 6;

    segments.push(`C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${p2.x} ${p2.y}`);
  }
  return segments.join(" ");
};

/* Convert "YYYY-MM" → "May 2025" (Hebrew short month + year) */
const formatMonth = (ym) => {
  if (!ym) return "";
  const [year, month] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return `${date.toLocaleDateString("he-IL", { month: "short" })}\u00A0${year}`;
};

/* ------------------------------------------------------------------ */
/*  Single interactive point (hover + keyboard focus)                 */
/* ------------------------------------------------------------------ */
const ChartPoint = ({ cx, cy, month, price, onEnter, onLeave }) => (
  <g
    className="chart-point"
    tabIndex="0"
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    onFocus={onEnter}
    onBlur={onLeave}
    onTouchStart={onEnter}
    onTouchEnd={onLeave}
  >
    <circle cx={cx} cy={cy} r="5" className="point" />
    {/* Native browser tooltip as a fallback */}
    <title>
      {month} — ₪{price.toLocaleString("he-IL")}
    </title>
  </g>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function MonthlyExpensesChart({
  data = {}, // e.g. { "2025-01": 89.3, … }
  height = 170, // total SVG height
  pointWidth = 100, // horizontal spacing between points
}) {
  /* 1 ▶︎ Parse & sort data -------------------------------------------- */
  const points = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b)) // chronological
      .map(([label, value]) => ({ label, value })); // {label,value}
  }, [data]);

  /* 2 ▶︎ Refs & Hooks (must be before any early return) --------------- */
  const pathRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null); // tooltip index

  /* 3 ▶︎ Stroke-drawing animation ------------------------------------- */
  useEffect(() => {
    if (!points.length) return;
    const path = pathRef.current;
    const length = path?.getTotalLength?.() ?? 0;
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    requestAnimationFrame(() => {
      path.style.transition = "stroke-dashoffset 4s ease";
      path.style.strokeDashoffset = 0;
    });
  }, [points]);

  /* 4 ▶︎ Empty-state card -------------------------------------------- */
  if (!points.length) {
    return (
      <div className="expenses-card empty">
        <h4 className="title">הוצאות חודשיות</h4>
        <p className="empty-text">אין נתונים</p>
      </div>
    );
  }

  /* 5 ▶︎ Build scales -------------------------------------------------- */
  const Y_STEP = 500;
  const maxValue = Math.max(...points.map((p) => p.value));
  const topGrid = Math.ceil(maxValue / Y_STEP) * Y_STEP;
  const yTicks = Array.from(
    { length: topGrid / Y_STEP + 1 },
    (_, i) => i * Y_STEP
  ).reverse();

  const TOP_PAD = 20;
  const BOTTOM_PAD = 20;
  const chartHeight = height - (TOP_PAD + BOTTOM_PAD);

  /** value → SVG y-coord */
  const getY = (value) => TOP_PAD + ((topGrid - value) / topGrid) * chartHeight;

  const halfCell = pointWidth / 2;
  const chartWidth = (points.length - 1) * pointWidth;
  const svgWidth = halfCell + chartWidth;

  /** index → SVG x-coord */
  const getX = (index) => halfCell + index * pointWidth;

  /* 6 ▶︎ Build smooth path ------------------------------------------- */
  const pathPoints = points.map(({ value }, i) => ({
    x: getX(i),
    y: getY(value),
  }));
  const pathD = buildSmoothPath(pathPoints);

  /* 7 ▶︎ Tooltip data ------------------------------------------------- */
  const tooltip =
    activeIndex === null
      ? null
      : (() => {
          const cx = getX(activeIndex);
          const cy = getY(points[activeIndex].value);
          const placeBelow = cy < height / 2; // top half → show below
          return {
            cx,
            cy,
            placeBelow,
            month: formatMonth(points[activeIndex].label),
            price: points[activeIndex].value.toLocaleString("he-IL", {
              style: "currency",
              currency: "ILS",
              minimumFractionDigits: 0,
            }),
          };
        })();

  /* 8 ▶︎ Render ------------------------------------------------------- */
  return (
    <div className="expenses-card">
      <h4 className="title">הוצאות חודשיות</h4>

      <div className="chart-body">
        {/* Y-axis labels */}
        <div className="y-axis">
          {yTicks.map((v) => (
            <span key={v}>₪{v}</span>
          ))}
        </div>

        {/* Scrollable SVG + X-axis */}
        <div className="scroll-area">
          <svg
            width={svgWidth}
            height={height}
            viewBox={`0 0 ${svgWidth} ${height}`}
            className="chart"
          >
            {/* horizontal grid */}
            {yTicks.map((v) => (
              <line
                key={v}
                x1="0"
                x2={svgWidth}
                y1={getY(v)}
                y2={getY(v)}
                className="grid"
              />
            ))}

            {/* smooth curve */}
            <path ref={pathRef} d={pathD} className="line" />

            {/* data points */}
            {points.map(({ label, value }, i) => (
              <ChartPoint
                key={label}
                cx={getX(i)}
                cy={getY(value)}
                month={formatMonth(label)}
                price={value}
                onEnter={() => setActiveIndex(i)}
                onLeave={() => setActiveIndex(null)}
              />
            ))}

            {/* tooltip bubble */}
            {tooltip && (
              <g
                className="tooltip"
                pointerEvents="none"
                transform={`translate(${tooltip.cx},${tooltip.cy})`}
              >
                {tooltip.placeBelow ? (
                  <>
                    <rect className="tooltip-box" x={-45} y={10} />
                    <text className="tt-month" x="0" y="26">
                      {tooltip.month}
                    </text>
                    <text className="tt-price" x="0" y="42">
                      {tooltip.price}
                    </text>
                  </>
                ) : (
                  <>
                    <rect className="tooltip-box" x={-45} y={-58} />
                    <text className="tt-month" x="0" y="-40">
                      {tooltip.month}
                    </text>
                    <text className="tt-price" x="0" y="-22">
                      {tooltip.price}
                    </text>
                  </>
                )}
              </g>
            )}
          </svg>

          {/* X-axis labels */}
          <div className="x-axis">
            {points.map(({ label }) => (
              <span key={label} style={{ minWidth: pointWidth }}>
                {formatMonth(label)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
