import React, { useEffect, useRef } from "react";
import "./CategoryNavigation.css";
import { useProductList } from "../../hooks/appHooks";
import { ReactComponent as CupOfDrink } from "./icons/cup-of-drink.svg";
import { ReactComponent as Freezer } from "./icons/freezer-safe.svg";
import { ReactComponent as WineBottle } from "./icons/wine-bottle.svg";
import { ReactComponent as Spices } from "./icons/spices.svg";
import { ReactComponent as BabyBottle } from "./icons/baby-bottle.svg";
import { ReactComponent as CannedFood } from "./icons/canned-food.svg";
import { ReactComponent as Crisps } from "./icons/crisps.svg";
import { ReactComponent as DairyProducts } from "./icons/dairy-products.svg";
import { ReactComponent as Cupcake } from "./icons/cupcake.svg";
import { ReactComponent as BeerMug } from "./icons/beer-mug.svg";
import { ReactComponent as ChocolateBar } from "./icons/chocolate-bar.svg";
import { ReactComponent as HotPot } from "./icons/hot-pot.svg";
import { ReactComponent as Martini } from "./icons/martini.svg";
import { ReactComponent as Disposable } from "./icons/disposable.svg";
import { ReactComponent as Spray } from "./icons/spray.svg";
import { ReactComponent as CookingOil } from "./icons/cooking-oil.svg";
import { ReactComponent as Sauces } from "./icons/sauces.svg";
import { ReactComponent as Cheese } from "./icons/cheese.svg";
import { ReactComponent as Pacifier } from "./icons/pacifier.svg";

const categoryIcons = {
  "משקאות קלים": { icons: [CupOfDrink] },
  המקפיא: { icons: [Freezer] },
  יינות: {
    icons: [WineBottle],
    transforms: ["rotate(30deg) scale(1.3) translateY(-2px)"],
  },
  "תבלינים, אבקות ומרקי אינסטנט": { icons: [Spices] },
  "פארם ותינוקות": { icons: [BabyBottle] },
  שימורים: { icons: [CannedFood] },
  "חטיפים ודגנים": { icons: [Crisps] },
  "חלב ביצים ומעדנים": { icons: [DairyProducts] },
  "אפייה ביתית": { icons: [Cupcake] },
  בירות: { icons: [BeerMug] },
  "מתוקים ושוקולד": { icons: [ChocolateBar] },
  "מוצרי בסיס לבישול": { icons: [HotPot] },
  "אלכוהול וקוקטיילים": { icons: [Martini] },
  "חד פעמי": { icons: [Disposable] },
  "ניקיון וטואלטיקה": { icons: [Spray] },
  "שמנים ורטבים": {
    icons: [Sauces, CookingOil],
    cssVars: ["--color-רטבים", "--color-שמנים"],
    transforms: [
      "translateX(10px) rotate(0)", // CookingOil
      "translateX(-13px) rotate(-15deg) translateY(-1px)", // CookingOil
    ],
  },

  גבינות: { icons: [Cheese] },
  "משקאות חמים": { icons: [CupOfDrink] },
  "מוצרי תינוקות": { icons: [Pacifier] },
};

const getFontSize = (text) => {
  if (text.length > 16) return "12px";
  if (text.length > 12) return "14px";
  return "16px";
};

const CategoryNavigation = () => {
  const {
    allCategories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProductList();

  const navigationRef = useRef(null);

  const handleTopicClick = (index) => {
    setActiveCategoryIndex(index);
    setActiveSubCategoryIndex(0);
    scrollToTopic(index);
  };

  const scrollToTopic = (index) => {
    if (!navigationRef.current) return;
    const topicElement = navigationRef.current.children[index];
    if (topicElement) {
      const containerWidth = navigationRef.current.clientWidth;
      const scrollX =
        topicElement.offsetLeft -
        (containerWidth / 2 - topicElement.clientWidth / 2);
      navigationRef.current.scrollTo({ left: scrollX, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToTopic(activeCategoryIndex);
  }, [activeCategoryIndex]);

  return (
    <div className="category-navigation-container">
      <div className="mobile-navigation" ref={navigationRef}>
        {allCategories.map((topic, index) => {
          const isActive = index === activeCategoryIndex;
          const config = categoryIcons[topic] || {};
          const icons = config.icons || [];
          const cssVars = config.cssVars || [
            `--color-${topic.replace(/ /g, "-").replace(/,/g, "")}`,
          ];

          return (
            <div
              key={index}
              className={`navigation-topic ${isActive ? "active-topic" : ""}`}
              onClick={() => handleTopicClick(index)}
            >
              <div className="icon-wrapper">
                {icons.map((IconComponent, i) => {
                  const fill = isActive
                    ? `var(${cssVars[i] || cssVars[0]})` // ← הצבע של הקטגוריה
                    : "var(--default-icon-color)"; // ← צבע ברירת-מחדל

                  return (
                    <IconComponent
                      key={i}
                      className="category-icon"
                      style={{
                        fill,
                        width: 24,
                        height: 24,
                        margin: "0 2px 4px 2px",
                        transform:
                          (config.transforms && config.transforms[i]) || "none",
                      }}
                    />
                  );
                })}
              </div>

              <span style={{ fontSize: getFontSize(topic) }}>{topic}</span>
              {isActive && <div className="navigation-topic-underline"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNavigation;
