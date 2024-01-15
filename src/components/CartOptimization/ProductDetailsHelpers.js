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
