const STORAGE_KEY_SHOP = "shop_settings";
const STORAGE_KEY_COUNTER = "invoice_counter";

async function loadPDFExporter() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return {
    jsPDF,
    autoTable: autoTableModule.default,
  };
}

const DEFAULT_SELLER = {
  name: "AppleStore Mini",
  taxCode: "",
  address: "",
  phone: "",
  email: "",
};

export function getSellerInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOP);
    if (raw) return { ...DEFAULT_SELLER, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SELLER };
}

export function getNextInvoiceNumber() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COUNTER);
    const num = raw ? parseInt(raw, 10) : 1;
    const formatted = String(num).padStart(7, "0");
    try {
      localStorage.setItem(STORAGE_KEY_COUNTER, String(num + 1));
    } catch { /* silently accept write failure */ }
    return formatted;
  } catch {
    return "0000001";
  }
}

export function generateInvoiceSymbol() {
  const year = new Date().getFullYear();
  return `ASM/${year}E`;
}

const UNITS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ"];

function readTriple(n) {
  const a = Math.floor(n / 100);
  const b = Math.floor((n % 100) / 10);
  const c = n % 10;
  const words = [];
  if (a > 0) {
    words.push(["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"][a]);
    words.push("trăm");
  }
  if (b === 0 && c > 0 && a > 0) {
    words.push("lẻ");
  } else if (b === 1) {
    words.push("mười");
  } else if (b > 1) {
    words.push(["", "", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"][b]);
    words.push("mươi");
  }
  if (c === 1 && b > 1) {
    words.push("mốt");
  } else if (c === 5 && b >= 1) {
    words.push("lăm");
  } else if (c === 4 && b >= 2) {
    words.push("tư");
  } else if (c > 0) {
    words.push(["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"][c]);
  }
  return words.join(" ");
}

export function numberToWords(n) {
  if (n === 0) return "không đồng";
  if (n < 0) return numberToWords(0);
  const intPart = Math.floor(n);
  if (intPart === 0) return "không đồng";
  const groups = [];
  let remaining = intPart;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  const parts = [];
  let hasContent = false;
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0 && hasContent) {
      parts.push("không trăm");
    } else if (groups[i] > 0) {
      parts.push(readTriple(groups[i]));
      hasContent = true;
    }
    if (i > 0 && (groups[i] > 0 || hasContent)) {
      parts.push(UNITS[i]);
    }
  }
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1) + " đồng";
}

const PAYMENT_LABELS = {
  cod: "COD", COD: "COD", vnpay: "VNPay", VNPAY: "VNPay", momo: "MoMo", MOMO: "MoMo",
};

export async function exportVATInvoicePDF({ order, buyerInfo, vatRate }) {
  if (!order || !buyerInfo) throw new Error("Thiếu dữ liệu đơn hàng hoặc thông tin người mua");

  const { jsPDF, autoTable } = await loadPDFExporter();
  const seller = getSellerInfo();
  const invoiceNumber = getNextInvoiceNumber();
  const invoiceSymbol = generateInvoiceSymbol();
  const today = new Date().toLocaleDateString("vi-VN");

  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  let y = 12;

  // Header: Seller info (left)
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text(seller.name || "AppleStore Mini", m, y);
  doc.setTextColor(80);
  doc.setFontSize(8);
  y += 4;
  if (seller.taxCode) { doc.text(`MST: ${seller.taxCode}`, m, y); y += 4; }
  if (seller.address) { doc.text(`${seller.address}`, m, y); y += 4; }
  if (seller.phone) { doc.text(`SĐT: ${seller.phone}`, m, y); y += 4; }
  if (seller.email) { doc.text(`Email: ${seller.email}`, m, y); y += 4; }

  // Header: Invoice symbol/number (right)
  doc.setFontSize(8);
  doc.setTextColor(128);
  const rightX = pw - m;
  doc.text(`Ký hiệu: ${invoiceSymbol}`, rightX, 12, { align: "right" });
  doc.text(`Số: ${invoiceNumber}`, rightX, 16, { align: "right" });
  doc.text(`Ngày: ${today}`, rightX, 20, { align: "right" });

  y = Math.max(y, 28);
  y += 2;

  // Separator line
  doc.setDrawColor(200);
  doc.line(m, y, pw - m, y);
  y += 5;

  // Title
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text("HÓA ĐƠN GIÁ TRỊ GIA TĂNG", pw / 2, y, { align: "center" });
  y += 10;

  // Buyer info
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("NGƯỜI MUA:", m, y);
  y += 5;
  doc.setFontSize(9);
  doc.text(`Tên đơn vị: ${buyerInfo.companyName || order.user?.fullName || "—"}`, m + 5, y);
  y += 4;
  if (buyerInfo.taxCode) {
    doc.text(`Mã số thuế: ${buyerInfo.taxCode}`, m + 5, y);
    y += 4;
  }
  if (buyerInfo.address) {
    doc.text(`Địa chỉ: ${buyerInfo.address}`, m + 5, y);
    y += 4;
  }
  y += 2;

  // Order reference
  doc.setFontSize(9);
  const orderCode = order.code || "unknown";
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—";
  doc.text(`Đơn hàng: #${orderCode}  |  Ngày tạo: ${orderDate}`, m, y);
  y += 8;

  // Items table
  const items = order.items || [];
  const tableHead = [["STT", "Tên sản phẩm", "ĐVT", "Số lượng", "Đơn giá (đ)", "Thành tiền (đ)"]];
  const tableBody = items.map((it, idx) => [
    String(idx + 1),
    it.name || "—",
    "Chiếc",
    String(it.quantity || 1),
    (it.price || 0).toLocaleString("vi-VN"),
    ((it.price || 0) * (it.quantity || 1)).toLocaleString("vi-VN"),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: tableHead,
    body: tableBody,
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 8 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      3: { halign: "center", cellWidth: 15 },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 6;

  // Tax calculation
  const subtotal = order.totalAmount || 0;
  const discount = order.discountAmount || 0;
  const taxableAmount = subtotal;
  const vatRateNumber = Number(vatRate) || 0;
  const priceBeforeTax = vatRateNumber > 0
    ? Math.round(taxableAmount / (1 + vatRateNumber / 100))
    : taxableAmount;
  const vatAmount = taxableAmount - priceBeforeTax;

  doc.setFontSize(9);
  doc.setTextColor(80);

  const rStart = pw - m - 70;
  const rEnd = pw - m;

  function drawRight(label, value, isBold) {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.text(label, rStart, y);
    doc.text(value, rEnd, y, { align: "right" });
    y += 5;
  }

  drawRight("Cộng tiền hàng:", priceBeforeTax.toLocaleString("vi-VN"), false);
  if (discount > 0) {
    doc.setTextColor(200, 0, 0);
    drawRight("Chiết khấu:", `-${discount.toLocaleString("vi-VN")}`, false);
    doc.setTextColor(80);
  }
  drawRight(`Thuế GTGT (${vatRate}%):`, vatAmount.toLocaleString("vi-VN"), false);
  y += 1;
  doc.setDrawColor(30, 64, 175);
  doc.line(rStart, y, rEnd, y);
  y += 3;
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.text("Tổng tiền thanh toán:", rStart, y);
  doc.text(subtotal.toLocaleString("vi-VN"), rEnd, y, { align: "right" });
  doc.setTextColor(80);

  y += 8;

  // Amount in words
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Số tiền bằng chữ: ${numberToWords(subtotal)}`, m, y);
  y += 8;

  // Payment method
  const method = order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : "—";
  doc.text(`Hình thức thanh toán: ${method}${order.isPaid ? " (Đã thanh toán)" : " (Chưa thanh toán)"}`, m, y);
  y += 12;

  // Signature blocks
  doc.text("NGƯỜI MUA", m, y, { align: "center", maxWidth: 60 });
  doc.text("(Ký, ghi rõ họ tên)", m, y + 4, { align: "center", maxWidth: 60 });
  doc.text("NGƯỜI BÁN", pw - m, y, { align: "center", maxWidth: 60 });
  doc.text("(Ký, ghi rõ họ tên)", pw - m, y + 4, { align: "center", maxWidth: 60 });

  const safeCode = String(orderCode).replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`HoaDonGTGT_${safeCode}.pdf`);
}
