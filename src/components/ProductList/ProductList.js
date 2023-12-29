import React, { useEffect, useRef, useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import "./ProductsList.css";
import { useNavigate } from "react-router";
import {
  updateProductInCart,
  addProductToCart,
  deleteProductFromCart,
} from "../../network/cartService";
import Image from "./Images";
import CategoryNavigation from "./CategoryNavigation";

export const convertWeightUnit = (weightUnit) => {
  weightUnit = weightUnit.toLowerCase();
  if (weightUnit === "g") {
    return "גרם";
  }
  if (weightUnit === "kg") {
    return 'ק"ג';
  }
  if (weightUnit === "ml") {
    return 'מ"ל';
  }
  if (weightUnit === "l") {
    return "ליטר";
  }
  if (weightUnit === "u") {
    return "יחידות";
  }
  return weightUnit;
};

const max18Characters = (str) => {
  if (str.length > 23) {
    return "..." + str.substring(0, 21);
  }
  return str;
};

const priceFormat = (price) => {
  return price.toFixed(2);
};

const discountPriceFormat = (price) => {
  const units = price.discount.units;
  const totalPrice = price.discount.totalPrice;
  return (
    <div
      className="list__discount-price"
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: "center",
        color: "#ff0000",
        fontWeight: "bold",
      }}
    >
      <p style={{ marginLeft: "0.3rem" }}>{units}</p>
      <p>{"יחידות ב"}</p>
      <p>{" - "}</p>
      <p>{priceFormat(totalPrice)}</p>
      <p style={{ fontWeight: "bold" }}>{"₪"}</p>
    </div>
  );
};

const makeVisible = (button) => {
  button.classList.add("visible");
};

const makeInvisible = (button) => {
  button.classList.remove("visible");
};

const changeButtonToAddProductButton = (button) => {
  button.style.backgroundColor = "#00c200";
  makeVisible(button);
  button.innerText = "הוסף לסל";
};

const changeButtonToNoChangeAmountButton = (button) => {
  makeInvisible(button);
};

const changeButtonToUpdateAmountButton = (button) => {
  button.style.backgroundColor = "#008cba";
  makeVisible(button);
  button.innerText = "עדכן כמות";
};

const changeButtonToDeleteProductButton = (button) => {
  button.style.backgroundColor = "#ff0000";
  makeVisible(button);
  button.innerText = "הסר מהסל";
};

function ProductsList() {
  const { products } = useProducts();
  const { allCategories, activeCategory, setActiveCategory } = useProducts();
  const { getProductsAmountInCart, loadCart } = useCart();
  const [productAmounts, setProductAmounts] = useState({});
  const [oldProductAmounts, setOldProductAmounts] = useState({});
  const userId = "1"; // Replace with actual user ID

  const [isLoadData, setIsLoadData] = useState(false);

  const nav = useNavigate();

  const [containerStyle, setContainerStyle] = useState({});
  const startTouch = useRef({ x: 0 });
  const swipeDirection = useRef(null); // To store the swipe direction

  // Load the product-amount in the cart
  useEffect(() => {
    const loadAmounts = async () => {
      setIsLoadData(true);
      const amounts = await getProductsAmountInCart(userId);
      const amountsObject = {};
      amounts.cart.products.forEach((product) => {
        amountsObject[product.barcode] = product.amount;
      });
      setProductAmounts(amountsObject);
      setOldProductAmounts(amountsObject);
      setIsLoadData(false);
    };
    loadAmounts();
  }, [getProductsAmountInCart]);

  if (isLoadData) {
    console.log("loading amounts");
    return <div>Loading Amounts...</div>;
  }

  const handleTouchStart = (event) => {
    const x = event.touches[0].clientX;
    startTouch.current = { x };
    swipeDirection.current = null; // Reset swipe direction on new touch
    setContainerStyle({});
  };

  const handleTouchMove = (event) => {
    const moveX = event.touches[0].clientX;
    const deltaX = moveX - startTouch.current.x;

    if (Math.abs(deltaX) > 150) {
      // Threshold for swipe recognition
      swipeDirection.current = deltaX > 0 ? "right" : "left";
    }
  };

  const handleTouchEnd = () => {
    if (swipeDirection.current === "right") {
      // Swipe right - previous category
      const currentIndex = allCategories.indexOf(activeCategory);
      const prevIndex =
        (currentIndex - 1 + allCategories.length) % allCategories.length;
      setActiveCategory(allCategories[prevIndex]);

      // Apply the middleToRight animation for 1 second
      setContainerStyle({ animation: "middleToRight 0.2s ease" });

      // After 1 second, apply the RightToLeft animation for 1 millisecond (in one step)
      setTimeout(() => {
        setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
      }, 200);

      // After RightToLeft animation, apply the RightToMiddle animation for 1 second
      setTimeout(() => {
        setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
      }, 201);

      // up to the top of the page:
      window.scrollTo(0, 0);
    } else if (swipeDirection.current === "left") {
      // Swipe left - next category
      const currentIndex = allCategories.indexOf(activeCategory);
      const nextIndex = (currentIndex + 1) % allCategories.length;
      setActiveCategory(allCategories[nextIndex]);

      // Apply the middleToLeft animation for 1 second
      setContainerStyle({ animation: "middleToLeft 0.2s ease" });

      // After 1 second, apply the LeftToRight animation for 1 millisecond (in one step)
      setTimeout(() => {
        setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
      }, 200);

      // After LeftToRight animation, apply the LeftToMiddle animation for 1 second
      setTimeout(() => {
        setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
      }, 201);

      // up to the top of the page:
      window.scrollTo(0, 0);
    } else {
      setContainerStyle({}); // Reset the container's position after the swipe
    }
  };

  const moveToPriceList = (productBarcode) => {
    nav(`/priceList/${productBarcode}`);
  };

  const incrementAmount = (barcode) => {
    const newAmount = (productAmounts[barcode] || 0) + 1;
    const button = document.querySelector(`#add-to-cart-${barcode}`);
    setProductAmounts({
      ...productAmounts,
      [barcode]: newAmount,
    });
    // case !old:
    if (!oldProductAmounts[barcode]) {
      console.log("green button -> is the old = active");
      changeButtonToAddProductButton(button);
    } else {
      // case old:
      // case new === 0: -> red and remove from the object:
      if (newAmount === 0) {
        console.log("red button -> is the old = active");
        changeButtonToDeleteProductButton(button);
      }
      // case new = old:
      else if (newAmount === oldProductAmounts[barcode]) {
        console.log("gray button -> is the old = active");
        changeButtonToNoChangeAmountButton(button);
      }
      // else (new > 0 && new != old):
      else {
        console.log(
          "blue button -> old != active and old != 0 and active != 0"
        );
        changeButtonToUpdateAmountButton(button);
      }
    }
  };

  const decrementAmount = (barcode) => {
    const newAmount = Math.max(0, (productAmounts[barcode] || 0) - 1);
    const button = document.querySelector(`#add-to-cart-${barcode}`);
    setProductAmounts({
      ...productAmounts,
      [barcode]: newAmount,
    });

    // case !old:
    if (!oldProductAmounts[barcode]) {
      // case new === 0:
      if (newAmount === 0) {
        console.log("gray button -> is the old = active");
        changeButtonToNoChangeAmountButton(button);
      }
      // case new > 0:
      else {
        // new > 0
        console.log("green button -> is the old = active");
        changeButtonToAddProductButton(button);
      }
    }
    // case old:
    else {
      // case new === 0:
      if (newAmount === 0) {
        console.log("red button -> is the old = active");
        changeButtonToDeleteProductButton(button);
      }
      // case new === old:
      else if (newAmount === oldProductAmounts[barcode]) {
        console.log("gray button -> is the old = active");
        changeButtonToNoChangeAmountButton(button);
      }
      // else (new > 0 && new != old):
      else {
        console.log(
          "blue button -> old != active and old != 0 and active != 0"
        );
        changeButtonToUpdateAmountButton(button);
      }
    }
  };

  const updateAmount = async (barcode) => {
    // if the new amount is 0 -> alert "delete from cart" and return:

    if (productAmounts[barcode] === 0 || !productAmounts[barcode]) {
      const button = document.querySelector(`#add-to-cart-${barcode}`);
      // gray button:
      console.log("gray button");
      changeButtonToNoChangeAmountButton(button);
      const response = await deleteProductFromCart(userId, barcode);
      console.log(response);
      await loadCart(userId);

      // update the oldProductAmounts:
      setOldProductAmounts({
        ...oldProductAmounts,
        [barcode]: productAmounts[barcode] || 0,
      });
      console.log("updated oldProductAmounts");
      return;
    }

    // case the old amount is 0 -> add to cart:

    if (!oldProductAmounts[barcode]) {
      // add to cart:
      const button = document.querySelector(`#add-to-cart-${barcode}`);
      // gray button:
      console.log("gray button");
      changeButtonToNoChangeAmountButton(button);
      const response = await addProductToCart(
        userId,
        barcode,
        productAmounts[barcode] || 0
      );
      console.log(response);
      await loadCart(userId);

      // update the oldProductAmounts:
      setOldProductAmounts({
        ...oldProductAmounts,
        [barcode]: productAmounts[barcode] || 0,
      });
      console.log("updated oldProductAmounts");
      return;
    }

    const button = document.querySelector(`#add-to-cart-${barcode}`);
    // gray button:
    console.log("gray button");
    changeButtonToNoChangeAmountButton(button);
    const response = await updateProductInCart(
      userId,
      barcode,
      productAmounts[barcode] || 0
    );
    console.log(response);
    await loadCart(userId);

    // update the oldProductAmounts:
    setOldProductAmounts({
      ...oldProductAmounts,
      [barcode]: productAmounts[barcode] || 0,
    });
    console.log("updated oldProductAmounts");
  };

  const filteredProducts = products.filter(
    (product) => product.category === activeCategory
  );
  return (
    <div className="list__product-list">
      <CategoryNavigation />
      <div className="list__products-wrapper">
        <div
          className="list__products-container"
          style={containerStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd} // Added onTouchEnd event
        >
          {filteredProducts.map((product) => (
            <div className="list__product-card" key={product.barcode}>
              {product.price && product.price.discount && (
                <div className="list__product-badge">מבצע</div>
              )}
              <div className="list__product-details">
                <div className="list__product-data">
                  <div className="list__product-name">
                    <p>{max18Characters(product.name)}</p>
                  </div>
                  <div className="list__product-info">
                    <div className="list__product-weight">
                      <p>{product.weight}</p>
                      <p>{convertWeightUnit(product.unitWeight)}</p>
                    </div>
                    <div className="list__separator">|</div>
                    <div className="list__product-brand">
                      <p>{product.brand}</p>
                    </div>
                  </div>
                  <div className="list__product-price">
                    <p>{product.price && priceFormat(product.price.price)}</p>
                    {product.price && <p style={{ fontSize: "1.4rem" }}>₪</p>}
                    {!product.hasPrice && <p>מחיר לא זמין בסופר</p>}
                  </div>
                  <div className="discount-price">
                    {product.price && product.price.discount && (
                      <>{discountPriceFormat(product.price)}</>
                    )}
                  </div>
                </div>
                <div
                  className="list__product-image"
                  onClick={() => moveToPriceList(product.barcode)}
                >
                  <Image barcode={product.barcode} />
                </div>
              </div>
              <div className="list__product-operations">
                <div
                  id={`add-to-cart-${product.barcode}`}
                  className="list__product-operations__confirm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAmount(product.barcode);
                  }}
                >
                  אין שינוי
                </div>
                <div
                  className="list__product-operations__add"
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementAmount(product.barcode);
                  }}
                >
                  +
                </div>
                <div className="list__product-operations__quantity">
                  <span>{productAmounts[product.barcode] || 0}</span>
                </div>
                <div
                  className="list__product-operations__reduce"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementAmount(product.barcode);
                  }}
                >
                  -
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsList;
