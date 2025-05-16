import httpClient from "../network/index";

/**
 * עוזר קטן – מחזיר אובייקט  (אם צריך → JSON.parse)
 */
const normalize = (data) =>
  typeof data === "string" ? JSON.parse(data) : data;

/**
 * מחזיר את העגלה הפעילה של userID=1
 * (ה-Context מצפה לאובייקט העגלה עצמו, לא למעטפת data)
 */
export const getActiveCart = async () => {
  try {
    const res = await httpClient.get("/carts/active/1");
    const payload = normalize(res.data); // { status, data:{ cart:{…} } }
    const cart = payload?.data?.cart || null;
    return cart; // null => “העגלה ריקה”
  } catch (err) {
    console.error("getActiveCart failed:", err.message);
    throw err;
  }
};

/**
 * מעדכן עגלה בשרת ומחזיר את העגלה המעודכנת
 */
export const updateCartData = async (cartID, updatedCart) => {
  const res = await httpClient.patch(`/carts/${cartID}`, updatedCart);
  const payload = normalize(res.data);
  return payload?.data?.cart || null;
};

export const updateActiveCart = async (supermarketID, products) => {
  try {
    await httpClient.post(
      "/carts/update-active-cart",
      JSON.stringify({
        supermarketID,
        products,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return;
  } catch (err) {
    console.error("updateActiveCart failed:", err);
    throw err;
  }
};


export const confirmCart = () => {
  try {
    // שליחת הבקשה לשרת בלי לחכות לתשובה
    httpClient.post(`/supermarket/confirm/1`);
  } catch (err) {
    console.error("confirmCart failed:", err.message);
  }
};
