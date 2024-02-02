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
