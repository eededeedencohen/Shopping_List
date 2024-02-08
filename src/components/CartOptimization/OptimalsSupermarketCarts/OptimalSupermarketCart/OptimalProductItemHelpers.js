export const getUnitWeightLabel = (unit) => {
  switch (unit) {
    case "g":
      return "גרם";
    case "ml":
      return 'מ"ל';
    case "kg":
      return 'ק"ג';
    case "l":
      return "ליטר";
    case "u":
      return "יחידות";
    default:
      return unit;
  }
};

export const getConvertedUnitWeight = (unitWeight) => {
  switch (unitWeight) {
    // cases g and kg -> return גרם
    case "g":
      return "גרם";
    case "kg":
      return "גרם";
    // cases ml and l -> return מ"ל
    case "ml":
      return 'מ"ל';
    case "l":
      return 'מ"ל';
    // case u -> return יחידות
    case "u":
      return "יחידות";
    default:
      return unitWeight;
  }
};

export const isExistsInOriginalCart = (DetailsOriginProduct) => {
  return DetailsOriginProduct.totalPrice > 0;
};

export const getUnitWeightLabelForOne = (
  totalPrice,
  quantity,
  unitWeight,
  weight
) => {
  const priceForOneUnit = totalPrice / quantity;

  let priceForOneUnitConverted;

  if (unitWeight === "kg") {
    priceForOneUnitConverted = priceForOneUnit / 1000;
  } else if (unitWeight === "l") {
    priceForOneUnitConverted = priceForOneUnit / 1000;
  } else {
    priceForOneUnitConverted = priceForOneUnit;
  }

  const priceForOne = (priceForOneUnitConverted * 100) / weight;

  return priceForOne.toFixed(2);
};

/**
 * @summary Get the converted weight to milliliters, grams or units
 *
 * @param {string} unitWeight
 * @param {number} weight
 *
 * @returns {number} the converted weight in milliliters, grams or units
 */
export const getConvertedWeight = (unitWeight, weight) => {
  // if the unit weight is kilograms (kg) or liters (l) -> convert the weight to grams or milliliters: else -> return the weight\
  if (unitWeight === "kg" || unitWeight === "l") {
    return weight * 1000;
  }
  return weight;
};

/**
 * @summary Get the price for 100 grams or milliliters or units
 *
 * @param {number} totalPrice: the total price of the product
 * @param {number} quantity: the quantity of the product in the cart
 * @param {number} weight: the weight of the product
 * @param {string} unitWeight: the unit weight of the product
 *
 * formula: (100 * totalPrice) / (convertedWeight * quantity)
 * @returns {number} the price for 100 grams or milliliters or units
 */
export const getPriceFor100 = (totalPrice, quantity, weight, unitWeight) => {
  const convertedWeight = getConvertedWeight(unitWeight, weight);

  const priceFor100 = (100 * totalPrice) / (convertedWeight * quantity);

  return priceFor100.toFixed(2);
};

/**
 * @summary Get the difference between the total prices of the
 *          product in the original cart and the optimal cart
 *
 * @param {number} price: the price of the product
 * @param {number} quantity: the quantity of the product in the cart
 */
export const getTotalPricesDifference = (
  originTotalPrice,
  optimalTotalPrice
) => {
  return (originTotalPrice - optimalTotalPrice).toFixed(2);
};

export const getTotalPricesDifferenceFor100GramOrMl = (
  originTotalPrice,
  originQuantity,
  optimalTotalPrice,
  optimalQuantity,
  weight,
  unitWeight
) => {
  // step 1: get the converted weight to grams or milliliters
  const convertedWeight = getConvertedWeight(unitWeight, weight);

  // step 2: get the price for 100 grams or milliliters for the original cart using getPriceFor100 function:
  const originPriceFor100 = getPriceFor100(
    originTotalPrice,
    originQuantity,
    convertedWeight,
    unitWeight
  );

  // step 3: get the price for 100 grams or milliliters for the optimal cart using getPriceFor100 function:
  const optimalPriceFor100 = getPriceFor100(
    optimalTotalPrice,
    optimalQuantity,
    convertedWeight,
    unitWeight
  );

  // step 4: get the difference between the price for 100 grams or milliliters of the original cart and the optimal cart
  const priceDifference = (originPriceFor100 - optimalPriceFor100).toFixed(2);

  return priceDifference;
};

export const getSummaryElement = (
  DetailsOptimalProduct,
  DetailsOriginProduct,
  isExistsInOptimalCart
) => {
  // case 1: the product exists in the optimal cart and in the original cart:
  if (isExistsInOptimalCart && isExistsInOriginalCart(DetailsOriginProduct)) {
    const priceDifference = getTotalPricesDifference(
      DetailsOriginProduct.totalPrice,
      DetailsOptimalProduct.totalPrice
    );
    // case the total price of the product in the optimal cart is
    // less than the total price of the product in the original cart:
    if (priceDifference > 0) {
      const productUnitWeight = getConvertedUnitWeight(
        DetailsOriginProduct.product.unitWeight
      );

      const convertedUnitWeight = getConvertedWeight(
        DetailsOriginProduct.product.unitWeight,
        DetailsOriginProduct.product.weight
      );

      const priceDifferenceFor100GramOrMl =
        getTotalPricesDifferenceFor100GramOrMl(
          DetailsOriginProduct.totalPrice,
          DetailsOriginProduct.amount,
          DetailsOptimalProduct.totalPrice,
          DetailsOptimalProduct.quantity,
          convertedUnitWeight,
          DetailsOriginProduct.product.unitWeight
        );
      return (
        <div className="product-exists-in-both-carts">
          <div className="price-difference">
            המחיר בסל הקניות האופטימלי נמוך ב-₪{priceDifference} מהמחיר בסל
            הקניות המקורי
          </div>
          <div className="price-difference-for-100-gram-or-ml">
            המחיר ל-100 {productUnitWeight} בסל הקניות האופטימלי נמוך ב-₪
            {priceDifferenceFor100GramOrMl} מהמחיר בסל הקניות המקורי
          </div>
        </div>
      );
    }
  }

  // case 2:

  // case 3:
};
