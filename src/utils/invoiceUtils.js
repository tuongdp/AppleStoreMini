import { numberToWords } from "./numberToWords";
import { createPdfDoc } from "./pdfFont";

const STORAGE_KEY_SHOP = "shop_settings";
const STORAGE_KEY_COUNTER = "invoice_counter";

const PAYMENT_LABELS = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "Thanh toán qua VNPay",
};

function getNextInvoiceNumber() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COUNTER);
    let num = raw ? parseInt(raw, 10) : 0;
    num += 1;
    localStorage.setItem(STORAGE_KEY_COUNTER, String(num));
    return String(num).padStart(7, "0");
  } catch {
    return String(Date.now()).slice(-7);
  }
}

function generateInvoiceSymbol() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  return `AS/${yy}E`;
}

function generateFormNumber() {
  return "01GTKT3/001";
}

async function loadAutoTable() {
  const mod = await import("jspdf-autotable");
  return mod.default;
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

export function cacheSellerInfo(info) {
  try {
    localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(info));
  } catch { /* ignore */ }
}

export async function exportVATInvoicePDF({ order, buyerInfo, vatRate, sellerInfo }) {
  if (!order || !buyerInfo) throw new Error("Thiếu dữ liệu đơn hàng hoặc thông tin người mua");

  const autoTable = await loadAutoTable();
  const seller = sellerInfo || getSellerInfo();
  const invoiceNumber = getNextInvoiceNumber();
  const invoiceSymbol = generateInvoiceSymbol();
  const formNumber = generateFormNumber();
  const today = new Date().toLocaleDateString("vi-VN");

  const doc = await createPdfDoc({ orientation: "p" });
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  let y = 10;

  // Header: Seller info (left)
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text(seller.name || "AppleStore Mini", m, y);
  doc.setTextColor(80);
  doc.setFontSize(7);
  y += 4;
  if (seller.taxCode) { doc.text(`MST: ${seller.taxCode}`, m, y); y += 3.5; }
  if (seller.address) { doc.text(`${seller.address}`, m, y); y += 3.5; }
  if (seller.phone) { doc.text(`SĐT: ${seller.phone}`, m, y); y += 3.5; }
  if (seller.email) { doc.text(`Email: ${seller.email}`, m, y); y += 3.5; }

  // Header: Form number, symbol, number (right)
  doc.setFontSize(7);
  doc.setTextColor(128);
  const rightX = pw - m;
  doc.text(`Mẫu số: ${formNumber}`, rightX, 10, { align: "right" });
  doc.text(`Ký hiệu: ${invoiceSymbol}`, rightX, 14, { align: "right" });
  doc.text(`Số: ${invoiceNumber}`, rightX, 18, { align: "right" });
  doc.text(`Ngày: ${today}`, rightX, 22, { align: "right" });

  y = Math.max(y, 30);
  y += 2;

  // Separator line
  doc.setDrawColor(200);
  doc.line(m, y, pw - m, y);
  y += 5;

  // Title
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text("HÓA ĐƠN GIÁ TRỊ GIA TĂNG", pw / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(`(Bản thể hiện của hóa đơn điện tử)`, pw / 2, y, { align: "center" });
  y += 8;

  // Buyer info
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("NGƯỜI MUA HÀNG:", m, y);
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
  const tableHead = [["STT", "Tên sản phẩm", "ĐVT", "SL", "Đơn giá (VNĐ)", "Thành tiền (VNĐ)"]];
  const tableBody = items.map((it, idx) => [
    String(idx + 1),
    it.name || "—",
    it.unit || "Chiếc",
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
  const itemsTotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  const discount = order.discountAmount || 0;
  const afterDiscount = Math.max(0, itemsTotal - discount);
  const vatRateNumber = Number(vatRate) || 0;
  const priceBeforeTax = vatRateNumber > 0
    ? Math.round(afterDiscount / (1 + vatRateNumber / 100))
    : afterDiscount;
  const vatAmount = afterDiscount - priceBeforeTax;
  const grandTotal = afterDiscount;

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

  drawRight("Tổng tiền hàng:", itemsTotal.toLocaleString("vi-VN"), false);
  if (discount > 0) {
    doc.setTextColor(200, 0, 0);
    drawRight("Chiết khấu:", `-${discount.toLocaleString("vi-VN")}`, false);
    doc.setTextColor(80);
  }
  if (vatRateNumber > 0) {
    drawRight(`Tiền trước thuế:`, priceBeforeTax.toLocaleString("vi-VN"), false);
    drawRight(`Thuế GTGT (${vatRate}%):`, vatAmount.toLocaleString("vi-VN"), false);
  }
  y += 1;
  doc.setDrawColor(30, 64, 175);
  doc.line(rStart, y, rEnd, y);
  y += 3;
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.text("Tổng tiền thanh toán:", rStart, y);
  doc.text(grandTotal.toLocaleString("vi-VN"), rEnd, y, { align: "right" });
  doc.setTextColor(80);

  y += 8;

  // Amount in words
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Số tiền bằng chữ: ${numberToWords(grandTotal)} đồng`, m, y);
  y += 8;

  // Payment method
  const method = order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : "—";
  doc.text(`Hình thức thanh toán: ${method}${order.isPaid ? " (Đã thanh toán)" : " (Chưa thanh toán)"}`, m, y);
  y += 12;

  // Signature blocks
  doc.setFontSize(9);
  doc.text("NGƯỜI MUA HÀNG", m + 15, y, { align: "center", maxWidth: 60 });
  doc.text("(Ký, ghi rõ họ tên)", m + 15, y + 4, { align: "center", maxWidth: 60 });
  doc.text("NGƯỜI BÁN HÀNG", pw - m - 15, y, { align: "center", maxWidth: 60 });
  doc.text("(Ký, đóng dấu, ghi rõ họ tên)", pw - m - 15, y + 4, { align: "center", maxWidth: 60 });

  const safeCode = String(orderCode).replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`HoaDonGTGT_${invoiceNumber}_${safeCode}.pdf`);
}
