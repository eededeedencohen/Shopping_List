/* ──────────────────────────────────────────────
   Test data – fake AI responses for each type
   ────────────────────────────────────────────── */

export const TEST_B1 = {
  messageToUser:
    "להלן מחירי דוריטוס בכל סניפי רמי לוי. תוכל למצוא את הרשימה המעודכנת למטה.",
  messageType: "B1 Result",
  actions: [],
  data: {
    "רמי לוי": [
      {
        branchName: "רמי לוי",
        branchAddress: "האומן,15",
        products: [
          {
            product: {
              _id: "646db90aadbba146043f714a",
              name: "דוריטוס חריף אש",
              hasUiqueBarcode: true,
              barcode: "7290010117864",
              brand: "דוריטוס",
              weight: 70,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f714a",
            },
            price: { price: 3.9, hasDiscount: false, discount: null },
          },
          {
            product: {
              _id: "646db90aadbba146043f714d",
              name: "דוריטוס חמוץ חריף",
              hasUiqueBarcode: true,
              barcode: "7290100850916",
              brand: "דוריטוס",
              weight: 70,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f714d",
            },
            price: { price: 3.9, hasDiscount: false, discount: null },
          },
          {
            product: {
              _id: "646db90aadbba146043f7148",
              name: "דוריטוס גריל",
              hasUiqueBarcode: true,
              barcode: "7290100850923",
              brand: "דוריטוס",
              weight: 70,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f7148",
            },
            price: { price: 3.9, hasDiscount: false, discount: null },
          },
          {
            product: {
              _id: "646db90aadbba146043f714f",
              name: "דוריטוס טבעי",
              hasUiqueBarcode: true,
              barcode: "7290106528628",
              brand: "דוריטוס",
              weight: 185,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f714f",
            },
            price: { price: 8.5, hasDiscount: false, discount: null },
          },
        ],
      },
      {
        branchName: "רמי לוי",
        branchAddress: "יד חרוצים 18",
        products: [
          {
            product: {
              _id: "646db90aadbba146043f714a",
              name: "דוריטוס חריף אש",
              hasUiqueBarcode: true,
              barcode: "7290010117864",
              brand: "דוריטוס",
              weight: 70,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f714a",
            },
            price: {
              price: 3.9,
              hasDiscount: true,
              discount: {
                units: 6,
                priceForUnit: 3.33,
                totalPrice: 20,
                _id: "67b341eac07fd56234a18be1",
              },
            },
          },
          {
            product: {
              _id: "646db90aadbba146043f714d",
              name: "דוריטוס חמוץ חריף",
              hasUiqueBarcode: true,
              barcode: "7290100850916",
              brand: "דוריטוס",
              weight: 70,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f714d",
            },
            price: {
              price: 3.9,
              hasDiscount: true,
              discount: {
                units: 6,
                priceForUnit: 3.33,
                totalPrice: 20,
                _id: "67b341ebc07fd56234a21a43",
              },
            },
          },
          {
            product: {
              _id: "646db90aadbba146043f714f",
              name: "דוריטוס טבעי",
              hasUiqueBarcode: true,
              barcode: "7290106528628",
              brand: "דוריטוס",
              weight: 185,
              unitWeight: "g",
              generalName: "דוריטוס",
              __v: 0,
              category: "חטיפים ודגנים",
              subcategory: "חטיפים מלוחים",
              id: "646db90aadbba146043f714f",
            },
            price: { price: 8.5, hasDiscount: false, discount: null },
          },
        ],
      },
    ],
  },
};

export const TEST_REGULAR_MESSAGE = {
  messageToUser: "שלום! אני העוזר החכם שלך לקניות. איך אפשר לעזור לך היום?",
  messageType: "regular",
  actions: [],
  data: null,
};

export const TEST_MONTHLY_EXPENSES = {
  messageToUser: "להלן סיכום ההוצאות החודשיות שלך:",
  messageType: "monthlyExpenses",
  actions: [],
  data: {
    "2025-07": 456.8,
    "2025-08": 723.5,
    "2025-09": 612.3,
    "2025-10": 890.1,
    "2025-11": 534.6,
    "2025-12": 978.2,
    "2026-01": 645.9,
    "2026-02": 812.4,
    "2026-03": 567.0,
  },
};

export const TEST_SHOW_CART = {
  messageToUser: "הנה העגלה שלך:",
  messageType: "showCart",
  actions: [],
  data: null,
};

export const TEST_CART_OPERATION_ADD = {
  messageToUser: "הוספתי דוריטוס חריף אש לעגלה!",
  messageType: "cartOperation",
  actions: {
    barcode: "7290010117864",
    newQuantity: 2,
    operationType: "add",
  },
  data: null,
};

export const TEST_CART_OPERATION_DELETE = {
  messageToUser: "הסרתי את המוצר מהעגלה.",
  messageType: "cartOperation",
  actions: {
    barcode: "7290010117864",
    newQuantity: 0,
    operationType: "delete",
  },
  data: null,
};

export const TEST_CART_BATCH_ADD = {
  messageToUser: "הוספתי 3 מוצרים לעגלה!",
  messageType: "cartBatchAdd",
  actions: [
    { barcode: "7290010117864", amount: 2, productName: "דוריטוס חריף אש" },
    { barcode: "7290100850916", amount: 1, productName: "דוריטוס חמוץ חריף" },
    { barcode: "7290100850923", amount: 3, productName: "דוריטוס גריל" },
  ],
  data: null,
};

export const ALL_TESTS = [
  {
    id: "b1",
    label: "B1 - השוואת מחירים",
    icon: "\uD83D\uDCCA",
    description: "תצוגת מחירי מוצרים בסניפים",
    data: TEST_B1,
  },
  {
    id: "message",
    label: "הודעה רגילה",
    icon: "\uD83D\uDCAC",
    description: "תשובת טקסט פשוטה",
    data: TEST_REGULAR_MESSAGE,
  },
  {
    id: "expenses",
    label: "סטטיסטיקת הוצאות",
    icon: "\uD83D\uDCC8",
    description: "גרף הוצאות חודשיות",
    data: TEST_MONTHLY_EXPENSES,
  },
  {
    id: "showCart",
    label: "תצוגת עגלה",
    icon: "\uD83D\uDED2",
    description: "הצגת עגלת הקניות",
    data: TEST_SHOW_CART,
  },
  {
    id: "cartAdd",
    label: "הוספה לעגלה",
    icon: "\u2795",
    description: "אנימציית הוספת מוצר",
    data: TEST_CART_OPERATION_ADD,
  },
  {
    id: "cartDelete",
    label: "הסרה מהעגלה",
    icon: "\uD83D\uDDD1\uFE0F",
    description: "אנימציית הסרת מוצר",
    data: TEST_CART_OPERATION_DELETE,
  },
  {
    id: "cartBatch",
    label: "הוספה מרובה",
    icon: "\uD83D\uDCE6",
    description: "הוספת מספר מוצרים בבת אחת",
    data: TEST_CART_BATCH_ADD,
  },
];
