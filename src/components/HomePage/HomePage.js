import { useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCartTotals } from "../../hooks/appHooks";
import "./HomePage.css";

import { ReactComponent as GroceryIcon } from "../Toolbar/grocery2.svg";
import { ReactComponent as CartIcon } from "../Toolbar/cart.svg";
import { ReactComponent as WishlistIcon } from "../Toolbar/wishlist.svg";
import { ReactComponent as HistoryIcon } from "../Toolbar/transaction-history.svg";
import { ReactComponent as PieChartIcon } from "../Toolbar/pie-chart.svg";
import { ReactComponent as AiIcon } from "../Toolbar/robot.svg";

/* ברכה לפי שעה */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "בוקר טוב", emoji: "\u2600\uFE0F" };
  if (hour >= 12 && hour < 17) return { text: "צהריים טובים", emoji: "\uD83C\uDF24\uFE0F" };
  if (hour >= 17 && hour < 21) return { text: "ערב טוב", emoji: "\uD83C\uDF05" };
  return { text: "לילה טוב", emoji: "\uD83C\uDF19" };
}

const FEATURES = [
  {
    key: "products",
    title: "רשימת מוצרים",
    desc: "עיין ובחר מוצרים לעגלה",
    path: "/products",
    Icon: GroceryIcon,
    className: "homepage__card--products",
  },
  {
    key: "cart",
    title: "עגלת קניות",
    desc: "צפה בעגלה ונהל אותה",
    path: "/cart",
    Icon: CartIcon,
    className: "homepage__card--cart",
    showBadge: true,
  },
  {
    key: "receipt",
    title: "סריקת קבלות",
    desc: "צלם קבלה ושמור להיסטוריה",
    path: "/image-parser",
    Icon: WishlistIcon,
    className: "homepage__card--receipt",
  },
  {
    key: "history",
    title: "היסטוריית קניות",
    desc: "עיין בקניות קודמות",
    path: "/history",
    Icon: HistoryIcon,
    className: "homepage__card--history",
  },
  {
    key: "stats",
    title: "סטטיסטיקות",
    desc: "גרפים וניתוח הוצאות",
    path: "/expense-overview",
    Icon: PieChartIcon,
    className: "homepage__card--stats",
  },
  {
    key: "ai",
    title: "עוזר AI",
    desc: "שאל את העוזר החכם",
    path: "/ai",
    Icon: AiIcon,
    className: "homepage__card--ai",
  },
];

function HomePage() {
  const { totalAmount } = useCartTotals();
  const greeting = useMemo(() => getGreeting(), []);
  const glassSquaresRef = useRef([]);

  /* יצירת ריבועים אקראיים פעם אחת */
  if (!glassSquaresRef.current.length) {
    glassSquaresRef.current = Array.from({ length: 20 }, () => ({
      size: 30 + Math.random() * 70,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 22 + Math.random() * 18,
      delay: -Math.random() * 20,
    }));
  }

  return (
    <div className="homepage">
      {/* רקע ריבועי זכוכית */}
      <div className="glass-bg">
        {glassSquaresRef.current.map((sq, idx) => (
          <div
            key={idx}
            className="glass-square"
            style={{
              width: `${sq.size}px`,
              height: `${sq.size}px`,
              left: `${sq.left}%`,
              top: `${sq.top}%`,
              animationDuration: `${sq.duration}s`,
              animationDelay: `${sq.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ברכה */}
      <div className="homepage__greeting">
        <span className="homepage__greeting-emoji">{greeting.emoji}</span>
        <h1 className="homepage__greeting-text">{greeting.text}</h1>
        <p className="homepage__greeting-sub">מה נעשה היום?</p>
      </div>

      {/* כרטיסי פיצ'רים */}
      <div className="homepage__grid">
        {FEATURES.map((feature) => (
          <Link
            key={feature.key}
            to={feature.path}
            className={`homepage__card ${feature.className}`}
          >
            {feature.showBadge && totalAmount > 0 && (
              <span className="homepage__card-badge">
                {totalAmount}
              </span>
            )}
            <div className="homepage__card-icon">
              <feature.Icon />
            </div>
            <p className="homepage__card-title">{feature.title}</p>
            <p className="homepage__card-desc">{feature.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
