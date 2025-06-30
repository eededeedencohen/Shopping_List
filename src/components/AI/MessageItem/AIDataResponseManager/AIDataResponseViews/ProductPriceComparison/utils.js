export const priceSignature = (price) =>
  price.hasDiscount
    ? `D-${price.price}-${price.discount.units}-${price.discount.totalPrice}`
    : `R-${price.price}`;

export function groupByBarcode(branches) {
  const map = {};
  for (const { branchAddress, products } of branches) {
    for (const { product, price } of products) {
      const bc = product.barcode;
      const sig = priceSignature(price);
      map[bc] ??= {};
      map[bc][sig] ??= { price, branches: [] };
      map[bc][sig].branches.push(branchAddress);
    }
  }
  const out = {};
  for (const [bc, sigMap] of Object.entries(map)) {
    const vals = Object.values(sigMap);
    out[bc] = vals.length === 1 ? vals[0] : vals;
  }
  return out;
}

export function compressData(raw) {
  const res = {};
  for (const [chain, branches] of Object.entries(raw)) {
    res[chain] = groupByBarcode(branches);
  }
  return res;
}
