import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a supermarket-style receipt PDF from purchase history data.
 * Creates a narrow thermal-receipt-sized PDF that looks like a real receipt.
 */
const generateReceiptPDF = async (cart, receiptId) => {
  // Receipt dimensions (80mm thermal receipt width)
  const RECEIPT_WIDTH_MM = 80;
  const MARGIN = 6;
  const CONTENT_WIDTH = RECEIPT_WIDTH_MM - MARGIN * 2;

  // Create hidden container for rendering
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  // Format helpers
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
  };

  const formatPrice = (price) => "₪" + Number(price).toFixed(2);

  const weightUnitToHebrew = (unit) => {
    switch (unit) {
      case "kg": return 'ק"ג';
      case "g": return "גרם";
      case "ml": return 'מ"ל';
      case "l": return "ליטר";
      default: return unit || "";
    }
  };

  const generateBarcodeNumber = (id) => {
    const hash = (id || "000").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return String(hash * 12345678).slice(0, 13).padStart(13, "0");
  };

  const { date, time } = formatDate(cart.date);
  const barcodeNum = generateBarcodeNumber(receiptId);

  // Build product rows HTML
  const buildProductRow = (p) => {
    // Detect discount: product has discount fields from the Price model
    // discount = { units, priceForUnit, totalPrice }, hasDiscount, price (regular)
    const hasPromo = p.hasDiscount && p.discount && p.discount.units > 1;

    if (hasPromo) {
      // ── DISCOUNT FORMAT ──
      // Regular total = amount * regular unit price
      const regularUnitPrice = p.price || (p.discount ? (p.discount.totalPrice / p.discount.units) : 0);
      const regularTotal = p.amount * regularUnitPrice;
      const discountAmount = regularTotal - p.totalPrice;

      return `
      <div style="padding:7px 0;border-bottom:1px dotted #bbb;">
        <!-- Product Name -->
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:700;font-size:12px;direction:rtl;flex:1;min-width:0;word-break:break-word;text-align:right;">${p.name}</div>
        </div>
        <!-- Brand / Weight -->
        <div style="font-size:10px;color:#666;direction:rtl;text-align:right;margin-top:1px;">
          ${p.brand ? p.brand + " | " : ""}${p.weight || ""}${p.unit ? " " + weightUnitToHebrew(p.unit) : ""}
        </div>
        <!-- Regular price line -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
          <div style="font-size:10px;color:#666;direction:ltr;text-align:left;">
            ${p.amount} x ${formatPrice(regularUnitPrice)}
          </div>
          <div style="font-size:12px;color:#666;white-space:nowrap;text-decoration:line-through;">
            ${formatPrice(regularTotal)}
          </div>
        </div>
        <!-- Discount line (minus) -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;padding:3px 6px;background:#fff3f3;border-radius:3px;">
          <div style="font-size:10px;color:#d32f2f;direction:rtl;text-align:right;font-weight:600;">
            מבצע ${p.discount.units} ב-${formatPrice(p.discount.totalPrice)}
          </div>
          <div style="font-size:12px;color:#d32f2f;font-weight:700;white-space:nowrap;">
            -${formatPrice(discountAmount)}
          </div>
        </div>
        <!-- Final price -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
          <div style="font-size:10px;color:#333;direction:rtl;font-weight:600;">סה"כ</div>
          <div style="font-weight:900;font-size:14px;white-space:nowrap;">${formatPrice(p.totalPrice)}</div>
        </div>
        <!-- Barcode -->
        <div style="font-size:11px;color:#000;font-family:'Courier New',monospace;margin-top:3px;text-align:right;direction:rtl;font-weight:700;">${p.barcode || ""}</div>
      </div>`;
    }

    // ── REGULAR FORMAT (no discount) ──
    const effUnitPrice = p.amount > 0 ? (p.totalPrice / p.amount) : p.totalPrice;

    return `
    <div style="padding:7px 0;border-bottom:1px dotted #bbb;">
      <!-- Row 1: Name + Total Price -->
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;font-size:12px;direction:rtl;flex:1;min-width:0;word-break:break-word;text-align:right;">${p.name}</div>
        <div style="font-weight:700;font-size:14px;white-space:nowrap;margin-left:10px;">${formatPrice(p.totalPrice)}</div>
      </div>
      <!-- Row 2: Qty x Unit Price + Brand/Weight -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
        <div style="font-size:10px;color:#666;direction:rtl;flex:1;min-width:0;text-align:right;">
          ${p.brand ? p.brand + " | " : ""}${p.weight || ""}${p.unit ? " " + weightUnitToHebrew(p.unit) : ""}
        </div>
        <div style="font-size:10px;color:#666;white-space:nowrap;margin-left:10px;">
          ${p.amount} x ${formatPrice(effUnitPrice)}
        </div>
      </div>
      <!-- Row 3: Barcode -->
      <div style="font-size:11px;color:#000;font-family:'Courier New',monospace;margin-top:3px;text-align:right;direction:rtl;font-weight:700;">${p.barcode || ""}</div>
    </div>`;
  };

  const productRows = cart.products.map(buildProductRow).join("");

  // ── EAN-13 barcode generator ──
  // Encoding tables for EAN-13
  const L_CODE = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  const G_CODE = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  const R_CODE = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
  const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

  const encodeEAN13 = (digits) => {
    const d = digits.split('').map(Number);
    const parityPattern = PARITY[d[0]];
    let bits = '101'; // start guard
    for (let i = 0; i < 6; i++) {
      bits += parityPattern[i] === 'L' ? L_CODE[d[i + 1]] : G_CODE[d[i + 1]];
    }
    bits += '01010'; // center guard
    for (let i = 0; i < 6; i++) {
      bits += R_CODE[d[i + 7]];
    }
    bits += '101'; // end guard
    return bits;
  };

  const barcodeBits = encodeEAN13(barcodeNum);
  const BAR_W = 2; // px per module
  const BAR_H = 55; // px height
  const barcodeWidth = barcodeBits.length * BAR_W;

  // Build barcode as individual bars
  const barcodeBars = barcodeBits.split('').map((bit, i) => {
    const isGuard = i < 3 || i >= barcodeBits.length - 3 || (i >= 45 && i <= 49);
    const h = isGuard ? BAR_H + 8 : BAR_H;
    if (bit === '1') {
      return `<div style="width:${BAR_W}px;height:${h}px;background:#000000;flex-shrink:0;"></div>`;
    }
    return `<div style="width:${BAR_W}px;height:${h}px;flex-shrink:0;"></div>`;
  }).join('');

  // Split barcode number for display under barcode (standard EAN-13: first digit, left group, right group)
  const barcodeDisplay = `${barcodeNum[0]}&nbsp;&nbsp;&nbsp;${barcodeNum.slice(1,7)}&nbsp;&nbsp;&nbsp;${barcodeNum.slice(7)}`;

  // Full receipt HTML
  container.innerHTML = `
    <div id="receipt-pdf-root" style="
      width:302px;
      background:#fffef8;
      font-family:Arial,Helvetica,sans-serif;
      color:#000;
      padding:16px 12px 20px;
      box-sizing:border-box;
    ">
      <!-- HEADER -->
      <div style="text-align:center;border-bottom:2px dashed #999;padding-bottom:14px;">
        <div style="font-size:22px;font-weight:900;letter-spacing:2px;margin-bottom:4px;direction:rtl;">** קבלה **</div>
        <div style="font-size:16px;font-weight:700;margin-bottom:2px;direction:rtl;">${cart.supermarketName || ""}</div>
        <div style="font-size:11px;color:#555;direction:rtl;">${cart.supermarketAddress || ""}, ${cart.supermarketCity || ""}</div>
        <div style="font-size:11px;color:#555;margin-top:6px;">${date}  ${time}</div>
        <div style="font-size:10px;color:#888;margin-top:2px;">ח.פ: 51${barcodeNum.slice(0, 7)}</div>
      </div>

      <!-- PRODUCTS HEADER -->
      <div style="text-align:center;font-size:11px;color:#777;padding:8px 0 4px;direction:rtl;letter-spacing:1px;">
        ═══════ פריטים ═══════
      </div>

      <!-- PRODUCTS -->
      <div style="padding:0 0 6px;">
        ${productRows}
      </div>

      <!-- TOTALS -->
      <div style="border-top:2px dashed #999;padding-top:10px;margin-top:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;direction:rtl;">
          <span style="font-size:12px;color:#555;">סה"כ פריטים:</span>
          <span style="font-size:12px;font-weight:700;">${cart.products.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;direction:rtl;">
          <span style="font-size:12px;color:#555;">סה"כ יחידות:</span>
          <span style="font-size:12px;font-weight:700;">${cart.products.reduce((s, p) => s + (p.amount || 0), 0)}</span>
        </div>
        ${(() => {
          // Calculate total savings from discounts
          const totalSavings = cart.products.reduce((sum, p) => {
            if (p.hasDiscount && p.discount && p.discount.units > 1 && p.price) {
              const regularTotal = p.amount * p.price;
              return sum + (regularTotal - p.totalPrice);
            }
            return sum;
          }, 0);
          if (totalSavings > 0) {
            return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 6px;margin-top:4px;background:#fff3f3;border-radius:4px;direction:rtl;">
              <span style="font-size:12px;color:#d32f2f;font-weight:700;">חסכת במבצעים:</span>
              <span style="font-size:14px;color:#d32f2f;font-weight:900;direction:ltr;unicode-bidi:bidi-override;">-${formatPrice(totalSavings)}</span>
            </div>`;
          }
          return '';
        })()}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:10px 8px;background:#f5f5e8;border-radius:4px;direction:rtl;">
          <span style="font-size:16px;font-weight:900;direction:rtl;">סכום לתשלום:</span>
          <span style="font-size:20px;font-weight:900;">${formatPrice(cart.totalPrice)}</span>
        </div>
      </div>

      <!-- PAYMENT INFO -->
      <div style="text-align:center;padding:10px 0 6px;font-size:10px;color:#888;border-bottom:1px dashed #ccc;">
        <div>אשראי / מזומן</div>
        <div style="margin-top:2px;">מע"מ כלול</div>
      </div>

      <!-- BARCODE (EAN-13) -->
      <div style="padding:16px 10px 10px;background:#ffffff;margin-top:4px;">
        <div style="display:flex;justify-content:center;align-items:flex-end;gap:0;width:${barcodeWidth}px;margin:0 auto;">
          ${barcodeBars}
        </div>
        <div style="text-align:center;font-size:13px;color:#000;letter-spacing:5px;margin-top:5px;font-family:'Courier New',monospace;font-weight:900;">
          ${barcodeDisplay}
        </div>
      </div>

      <div style="text-align:center;font-size:10px;color:#aaa;margin-top:14px;">
        www.shopping-list.app
      </div>
    </div>
  `;

  try {
    const receiptEl = container.querySelector("#receipt-pdf-root");

    // Render HTML to canvas
    const canvas = await html2canvas(receiptEl, {
      scale: 3, // High resolution
      backgroundColor: "#fffef8",
      useCORS: true,
      logging: false,
    });

    // Calculate PDF dimensions
    const imgWidth = RECEIPT_WIDTH_MM;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF with exact receipt dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [RECEIPT_WIDTH_MM, imgHeight + 10],
    });

    // Add the receipt image
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 2, imgWidth, imgHeight);

    // Generate filename
    const safeName = (cart.supermarketName || "receipt").replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, "_");
    const fileName = `receipt_${safeName}_${date.replace(/\//g, "-")}.pdf`;

    // Save PDF
    pdf.save(fileName);
  } catch (err) {
    console.error("Error generating receipt PDF:", err);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
};

export default generateReceiptPDF;
