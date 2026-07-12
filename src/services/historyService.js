import axios from "axios";
import { DOMAIN } from "../constants";

/* Purchase history (confirmed carts + OCR-imported receipts), newest first.
   Each product carries its generalName + barcode + amount + date — used by the
   "complete cart" last-purchased strategy. */
export const getPurchaseHistory = async () => {
  try {
    const res = await axios.get(`${DOMAIN}/api/v1/history?sort=-date`);
    return (
      (res && res.data && res.data.data && res.data.data.history) || []
    );
  } catch (e) {
    console.error("getPurchaseHistory failed:", e && e.message);
    return [];
  }
};
