export const formatProductWeight = (productWeight, productUnitWeight) => {
  if (productUnitWeight === "kg" || productUnitWeight === "l") {
    return productWeight * 1000;
  }
  return productWeight;
};

export const reverseFormatProductWeight = (
  productWeight,
  productUnitWeight
) => {
  if (productUnitWeight === "kg" || productUnitWeight === "l") {
    return productWeight / 1000;
  }
  return productWeight;
};
