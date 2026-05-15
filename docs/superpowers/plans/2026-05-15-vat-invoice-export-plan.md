# VAT Invoice Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vietnamese-standard VAT invoice (Hóa đơn GTGT) PDF export to admin and customer order detail pages, with buyer info popup dialog and shop settings configuration form.

**Architecture:** Pure client-side — jsPDF generates A4 PDF from RTK Query order data + user-entered buyer info + localStorage shop settings. Auto-incrementing invoice counter stored in localStorage. No backend changes needed.

**Tech Stack:** jsPDF v4.2.1, jspdf-autotable v5.0.7, React, Radix UI Dialog, shadcn/ui components

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/utils/invoiceUtils.js` | Create | Core: `exportVATInvoicePDF()`, `numberToWords()`, `getNextInvoiceNumber()`, `getSellerInfo()`, `generateInvoiceSymbol()` |
| `src/components/shared/VATInvoiceDialog.jsx` | Create | Popup dialog: buyer company name, tax code, address, VAT rate selector |
| `src/features/admin/components/shop/AdminShopSettings.jsx` | Create | Admin form: shop name, tax code, address, phone, email (localStorage) |
| `src/pages/admin/AdminShopSettings.jsx` | Create | Page wrapper for shop settings |
| `src/routes.jsx` | Modify | Add route `/admin/settings/shop` |
| `src/features/admin/components/orders/AdminOrderDetail.jsx` | Modify | Add "Xuất hóa đơn GTGT" button + VATInvoiceDialog |
| `src/features/orders/components/OrderDetail.jsx` | Modify | Add "Xuất hóa đơn GTGT" button + VATInvoiceDialog (customer side) |

---

### Task 1: Create invoiceUtils.js — Core VAT Invoice PDF Generator

**Files:**
- Create: `src/utils/invoiceUtils.js`

- [ ] **Step 1: Write the complete invoiceUtils.js**

```js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const STORAGE_KEY_SHOP = "shop_settings";
const STORAGE_KEY_COUNTER = "invoice_counter";
const STORAGE_KEY_SYMBOL = "invoice_symbol";

const DEFAULT_SELLER = {
  name: "AppleStore Mini",
  taxCode: "",
  address: "",
  phone: "",
  email: "",
};

function getSellerInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOP);
    if (raw) return { ...DEFAULT_SELLER, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SELLER };
}

function getNextInvoiceNumber() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COUNTER);
    const num = raw ? parseInt(raw, 10) : 1;
    const formatted = String(num).padStart(7, "0");
    localStorage.setItem(STORAGE_KEY_COUNTER, String(num + 1));
    return formatted;
  } catch {
    return "0000001";
  }
}

function generateInvoiceSymbol() {
  const year = new Date().getFullYear();
  return `ASM/${year}E`;
}

const UNITS = ["", "nghìn", "triệu", "tỷ"];

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

function numberToWords(n) {
  if (n === 0) return "không đồng";
  if (n < 0) return "âm " + numberToWords(Math.abs(n));
  const intPart = Math.floor(n);
  if (intPart === 0) return "không đồng";
  const groups = [];
  let remaining = intPart;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    parts.push(readTriple(groups[i]));
    if (i > 0) parts.push(UNITS[i]);
  }
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1) + " đồng";
}

const PAYMENT_LABELS = {
  cod: "COD", momo: "MoMo", vnpay: "VNPay",
  zalopay: "ZaloPay", bank_transfer: "Chuyển khoản",
};

export function exportVATInvoicePDF({ order, buyerInfo, vatRate }) {
  if (!order || !buyerInfo) return;

  const seller = getSellerInfo();
  const invoiceNumber = getNextInvoiceNumber();
  const invoiceSymbol = generateInvoiceSymbol();
  const today = new Date().toLocaleDateString("vi-VN");

  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  let y = 12;

  // ── Header: Seller info (left) + Invoice symbol/number (right) ──
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text(seller.name || "AppleStore Mini", m, y);
  doc.setTextColor(80);
  doc.setFontSize(8);
  y += 4;
  if (seller.taxCode) { doc.text(`MST: ${seller.taxCode}`, m, y); y += 4; }
  if (seller.address) { doc.text(`${seller.address}`, m, y); y += 4; }
  if (seller.phone) { doc.text(`SĐT: ${seller.phone}`, m, y); y += 4; }

  doc.setFontSize(8);
  doc.setTextColor(128);
  const rightX = pw - m;
  doc.text(`Ký hiệu: ${invoiceSymbol}`, rightX, 12, { align: "right" });
  doc.text(`Số: ${invoiceNumber}`, rightX, 16, { align: "right" });
  doc.text(`Ngày: ${today}`, rightX, 20, { align: "right" });

  y = Math.max(y, 28);
  y += 2;

  // ── Separator line ──
  doc.setDrawColor(200);
  doc.line(m, y, pw - m, y);
  y += 5;

  // ── Title ──
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text("HÓA ĐƠN GIÁ TRỊ GIA TĂNG", pw / 2, y, { align: "center" });
  y += 10;

  // ── Buyer info ──
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

  // ── Order reference ──
  doc.setFontSize(9);
  doc.text(`Đơn hàng: #${order.code}  |  Ngày tạo: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`, m, y);
  y += 8;

  // ── Items table ──
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

  // ── Tax calculation ──
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

  // ── Amount in words ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Số tiền bằng chữ: ${numberToWords(subtotal)}`, m, y);
  y += 8;

  // ── Payment method ──
  const method = order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : "—";
  doc.text(`Hình thức thanh toán: ${method}${order.isPaid ? " (Đã thanh toán)" : " (Chưa thanh toán)"}`, m, y);
  y += 12;

  // ── Signature blocks ──
  doc.text("NGƯỜI MUA", m, y, { align: "center", maxWidth: 60 });
  doc.text("(Ký, ghi rõ họ tên)", m, y + 4, { align: "center", maxWidth: 60 });
  doc.text("NGƯỜI BÁN", pw - m, y, { align: "center", maxWidth: 60 });
  doc.text("(Ký, ghi rõ họ tên)", pw - m, y + 4, { align: "center", maxWidth: 60 });

  const safeCode = String(order.code || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`HoaDonGTGT_${safeCode}.pdf`);
}
```

- [ ] **Step 2: Verify file created**

Run: `Test-Path -LiteralPath "src/utils/invoiceUtils.js"`

---

### Task 2: Create VATInvoiceDialog.jsx — Buyer Info Popup

**Files:**
- Create: `src/components/shared/VATInvoiceDialog.jsx`

- [ ] **Step 1: Write the complete VATInvoiceDialog.jsx**

```jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportVATInvoicePDF } from "@/utils/invoiceUtils";
import { toast } from "sonner";

const VAT_RATE_OPTIONS = [
  { value: "10", label: "10%" },
  { value: "8", label: "8%" },
];

export default function VATInvoiceDialog({ open, onClose, order }) {
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [address, setAddress] = useState("");
  const [vatRate, setVatRate] = useState("10");
  const [customRate, setCustomRate] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setCompanyName("");
    setTaxCode("");
    setAddress("");
    setVatRate("10");
    setCustomRate("");
    setIsCustom(false);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Vui lòng nhập tên công ty";
    if (!taxCode.trim()) newErrors.taxCode = "Vui lòng nhập mã số thuế";
    if (isCustom) {
      const rate = Number(customRate);
      if (!customRate || isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.vatRate = "Thuế suất không hợp lệ";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExport = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const finalRate = isCustom ? Number(customRate) : Number(vatRate);
      exportVATInvoicePDF({
        order,
        buyerInfo: {
          companyName: companyName.trim(),
          taxCode: taxCode.trim(),
          address: address.trim(),
        },
        vatRate: finalRate,
      });
      toast.success("Đã xuất hóa đơn GTGT");
      handleClose();
    } catch (err) {
      console.error("Export VAT invoice failed:", err);
      toast.error("Xuất hóa đơn thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất hóa đơn GTGT</DialogTitle>
          <DialogDescription>
            Nhập thông tin công ty người mua để xuất hóa đơn giá trị gia tăng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Tên công ty <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Nhập tên công ty"
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); setErrors((p) => ({ ...p, companyName: undefined })); }}
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxCode">
              Mã số thuế <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxCode"
              placeholder="Nhập mã số thuế"
              value={taxCode}
              onChange={(e) => { setTaxCode(e.target.value); setErrors((p) => ({ ...p, taxCode: undefined })); }}
            />
            {errors.taxCode && (
              <p className="text-xs text-destructive">{errors.taxCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              placeholder="Nhập địa chỉ công ty"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Thuế suất GTGT</Label>
            <div className="flex items-center gap-3">
              <Select
                value={isCustom ? "custom" : vatRate}
                onValueChange={(val) => {
                  if (val === "custom") {
                    setIsCustom(true);
                  } else {
                    setIsCustom(false);
                    setVatRate(val);
                    setErrors((p) => ({ ...p, vatRate: undefined }));
                  }
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VAT_RATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Khác</SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <div className="flex items-center gap-1">
                  <Input
                    className="w-20"
                    placeholder="0"
                    value={customRate}
                    onChange={(e) => { setCustomRate(e.target.value); setErrors((p) => ({ ...p, vatRate: undefined })); }}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
            </div>
            {errors.vatRate && (
              <p className="text-xs text-destructive">{errors.vatRate}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Đang xuất..." : "Xuất hóa đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify file created**

Run: `Test-Path -LiteralPath "src/components/shared/VATInvoiceDialog.jsx"`

---

### Task 3: Create AdminShopSettings.jsx Component — Shop Info Form

**Files:**
- Create: `src/features/admin/components/shop/AdminShopSettings.jsx`

- [ ] **Step 1: Write AdminShopSettings.jsx**

```jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const STORAGE_KEY = "shop_settings";

const DEFAULTS = {
  name: "AppleStore Mini",
  taxCode: "",
  address: "",
  phone: "",
  email: "",
};

export default function AdminShopSettings() {
  const [fields, setFields] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFields((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  const handleChange = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!fields.name.trim()) newErrors.name = "Tên cửa hàng không được để trống";
    if (!fields.taxCode.trim()) newErrors.taxCode = "Mã số thuế không được để trống";
    if (!fields.address.trim()) newErrors.address = "Địa chỉ không được để trống";
    if (!fields.phone.trim()) newErrors.phone = "Số điện thoại không được để trống";
    if (!fields.email.trim()) newErrors.email = "Email không được để trống";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    toast.success("Đã lưu thông tin cửa hàng");
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cửa hàng</CardTitle>
          <CardDescription>
            Cấu hình thông tin người bán hiển thị trên hóa đơn GTGT.
            Dữ liệu được lưu trên trình duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Tên cửa hàng</Label>
            <Input
              id="shop-name"
              value={fields.name}
              onChange={handleChange("name")}
              placeholder="Nhập tên cửa hàng"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shop-taxCode">Mã số thuế</Label>
              <Input
                id="shop-taxCode"
                value={fields.taxCode}
                onChange={handleChange("taxCode")}
                placeholder="Mã số thuế"
              />
              {errors.taxCode && <p className="text-xs text-destructive">{errors.taxCode}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-phone">Số điện thoại</Label>
              <Input
                id="shop-phone"
                value={fields.phone}
                onChange={handleChange("phone")}
                placeholder="Số điện thoại"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop-address">Địa chỉ</Label>
            <Input
              id="shop-address"
              value={fields.address}
              onChange={handleChange("address")}
              placeholder="Nhập địa chỉ cửa hàng"
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop-email">Email</Label>
            <Input
              id="shop-email"
              type="email"
              value={fields.email}
              onChange={handleChange("email")}
              placeholder="Email cửa hàng"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Lưu thông tin</Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify file created**

Run: `Test-Path -LiteralPath "src/features/admin/components/shop/AdminShopSettings.jsx"`

---

### Task 4: Create AdminShopSettings.jsx Page Wrapper

**Files:**
- Create: `src/pages/admin/AdminShopSettings.jsx`

- [ ] **Step 1: Write page wrapper**

```jsx
import AdminShopSettingsComponent from "@/features/admin/components/shop/AdminShopSettings";

export default function AdminShopSettingsPage() {
  return <AdminShopSettingsComponent />;
}
```

- [ ] **Step 2: Verify file created**

Run: `Test-Path -LiteralPath "src/pages/admin/AdminShopSettings.jsx"`

---

### Task 5: Add Route for Shop Settings

**Files:**
- Modify: `src/routes.jsx`

- [ ] **Step 1: Add lazy page import**

In `src/routes.jsx`, add after the existing admin page imports (after line 88):

```js
const AdminShopSettingsPage = lazyPage(() => import("@/pages/admin/AdminShopSettings"));
```

- [ ] **Step 2: Add route**

In the admin children array (after the `options` route on line 203), add:

```js
{ path: "settings/shop", element: <AdminShopSettingsPage /> },
```

- [ ] **Step 3: Verify the edit**

Run: `Select-String -LiteralPath "src\routes.jsx" -Pattern "settings/shop"`

---

### Task 6: Add VAT Invoice Button to AdminOrderDetail

**Files:**
- Modify: `src/features/admin/components/orders/AdminOrderDetail.jsx`

- [ ] **Step 1: Add import for VATInvoiceDialog**

In `src/features/admin/components/orders/AdminOrderDetail.jsx`, add after the existing imports:

```js
import VATInvoiceDialog from "@/components/shared/VATInvoiceDialog";
```

- [ ] **Step 2: Add state for VAT dialog**

After `const [isExportingPDF, setIsExportingPDF] = useState(false);` (line 182), add:

```js
const [vatDialogOpen, setVatDialogOpen] = useState(false);
```

- [ ] **Step 3: Add "Xuất hóa đơn GTGT" button**

After the `ExportButton` component (after line 242), add:

```jsx
<Button
    size="sm"
    variant="outline"
    className="rounded-full"
    onClick={() => setVatDialogOpen(true)}
>
    Xuất hóa đơn GTGT
</Button>
```

- [ ] **Step 4: Add VATInvoiceDialog at end of JSX**

Before the closing `</div>` of the outermost div (before line 496 `</div>`), add:

```jsx
<VATInvoiceDialog
    open={vatDialogOpen}
    onClose={() => setVatDialogOpen(false)}
    order={order}
/>
```

- [ ] **Step 5: Verify the edit**

Run: `Select-String -LiteralPath "src\features\admin\components\orders\AdminOrderDetail.jsx" -Pattern "VATInvoiceDialog"`

---

### Task 7: Add VAT Invoice Button to Customer OrderDetail

**Files:**
- Modify: `src/features/orders/components/OrderDetail.jsx`

- [ ] **Step 1: Add import and state**

In `src/features/orders/components/OrderDetail.jsx`, add import after existing imports:

```js
import VATInvoiceDialog from "@/components/shared/VATInvoiceDialog";
```

After `const [returnOpen, setReturnOpen] = useState(false);` (line 49), add:

```js
const [vatDialogOpen, setVatDialogOpen] = useState(false);
```

- [ ] **Step 2: Add button in the header actions area**

In the header action buttons area (after the return button on line 188), add:

```jsx
<Button
    size="sm"
    variant="outline"
    className="rounded-full"
    onClick={() => setVatDialogOpen(true)}
>
    Xuất hóa đơn GTGT
</Button>
```

- [ ] **Step 3: Add VATInvoiceDialog at end of JSX**

Before the closing `</div>` of the outermost div (before line 516), add:

```jsx
<VATInvoiceDialog
    open={vatDialogOpen}
    onClose={() => setVatDialogOpen(false)}
    order={order}
/>
```

- [ ] **Step 4: Verify the edit**

Run: `Select-String -LiteralPath "src\features\orders\components\OrderDetail.jsx" -Pattern "VATInvoiceDialog"`

---

### Task 8: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Check for any new lint errors**

```bash
npm run lint
```

Expected: No new lint errors beyond pre-existing ones.
