import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";
import { ReactComponent as HomeIcon } from "../Toolbar/home.svg";
import { ReactComponent as ProductsIcon } from "../Toolbar/grocery2.svg";
import { ReactComponent as BarcodeIcon } from "../Toolbar/barcode.svg";
import { ReactComponent as RobotIcon } from "../Toolbar/robot.svg";
import { ReactComponent as ReceiptIcon } from "../Toolbar/wishlist.svg";

const ALLOWED_PATHS = ["/", "/products", "/barcode-scanner", "/image-parser"];

const NAV_ITEMS = [
  { to: "/", Icon: HomeIcon, label: "בית" },
  { to: "/products", Icon: ProductsIcon, label: "מוצרים" },
  { to: "/barcode-scanner", Icon: BarcodeIcon, label: "סריקת ברקוד" },
  { to: "/image-parser", Icon: ReceiptIcon, label: "קבלה להיסטוריה" },
  { to: "/ai", Icon: RobotIcon, label: "AI" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  if (!ALLOWED_PATHS.includes(pathname)) return null;

  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      <ul className="bottom-nav__list">
        {NAV_ITEMS.map(({ to, Icon, label }) => {
          const active = pathname === to;
          return (
            <li
              key={to}
              className={`bottom-nav__item ${active ? "is-active" : ""}`}
            >
              <Link
                to={to}
                className="bottom-nav__link"
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="bottom-nav__icon" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
