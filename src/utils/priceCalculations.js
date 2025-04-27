/**
 * Calculate total price for a given amount and price data (with/without discount)
 * @param {number} amount - amount of product in cart
 * @param {Object} priceData - includes price, hasDiscount, discount object
 * @returns {number} totalPrice
 */
export const calculateTotalPrice = (amount, priceData) => {
  if (!priceData) return 0;

  if (priceData.hasDiscount && priceData.discount) {
    const { units, totalPrice } = priceData.discount;
    const fullDiscountBundles = Math.floor(amount / units);
    const remainingUnits = amount % units;
    return fullDiscountBundles * totalPrice + remainingUnits * priceData.price;
  }

  return amount * (priceData.price || 0);
};
