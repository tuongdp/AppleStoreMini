# Admin Export Reports — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Excel (.xlsx) and PDF (.pdf) export buttons to every admin management page and the dashboard, using client-side generation from existing RTK Query data.

**Architecture:** Three new files — `exportUtils.js` (SheetJS + jsPDF core), `useExport.js` (hook wrapping utils with loading state), `ExportButton.jsx` (dropdown UI component). Each existing page/table gets an export button wired to the hook. No backend changes needed.

**Tech Stack:** SheetJS/xlsx (already installed), jsPDF + jspdf-autotable (new), shadcn/ui DropdownMenu, lucide-react icons, sonner toast

**Spec:** `docs/superpowers/specs/2026-05-15-admin-export-reports-design.md`

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install jsPDF and jspdf-autotable**

```bash
npm install jspdf jspdf-autotable
```

Expected: packages added to `package.json` `dependencies`

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add jsPDF + jspdf-autotable for export"
```

---

### Task 2: Create core export utilities

**Files:**
- Create: `src/utils/exportUtils.js`

- [ ] **Step 1: Create `src/utils/exportUtils.js`**

```js
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const EXCEL_HEADER_BG = "1e40af";
const EXCEL_HEADER_FG = "ffffff";
const EXCEL_STRIPE = "f3f4f6";

function formatCellValue(value, format) {
  if (value == null) return "—";
  if (format === "currency") return Number(value);
  if (format === "date" && value) {
    const d = new Date(value);
    if (!isNaN(d)) {
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }
  }
  return value;
}

function columnWidth(val, col, maxChars) {
  const str = String(val ?? "");
  const w = Math.min(str.length * 1.3 + 3, maxChars ?? 40);
  return Math.max(w, (col.label?.length ?? col.header?.length ?? 8) * 1.2 + 2);
}

/**
 * sheets: [{ name: "Sheet1", columns: [{ key, label, format? }], rows: [{}] }]
 * filename: "BaoCao.xlsx"
 */
export async function exportToExcel({ sheets, filename }) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, columns, rows }) => {
    const header = columns.map((c) => c.label);
    const data = rows.map((row) => columns.map((c) => formatCellValue(row[c.key], c.format)));
    const wsData = [header, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = columns.map((c, i) => {
      let maxW = columnWidth(c.label, c, 40);
      data.forEach((r) => {
        maxW = Math.max(maxW, columnWidth(r[i], c, 40));
      });
      return { wch: Math.round(maxW) };
    });
    ws["!cols"] = colWidths;

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        if (R === 0) {
          ws[addr].s = {
            font: { bold: true, color: { rgb: EXCEL_HEADER_FG } },
            fill: { fgColor: { rgb: EXCEL_HEADER_BG } },
            alignment: { horizontal: "center", vertical: "center" },
          };
        } else {
          ws[addr].s = ws[addr].s || {};
          const colFormat = columns[C]?.format;
          if (colFormat === "currency") {
            ws[addr].s.numFmt = "#,##0";
            ws[addr].s.alignment = { horizontal: "right" };
          }
          if (R % 2 === 0) {
            ws[addr].s.fill = { fgColor: { rgb: EXCEL_STRIPE } };
          }
        }
      }
    }
    ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/**
 * columns: [{ key, label, format?, width? }]
 * rows: [{}]
 */
export async function exportToPDF({ title, subtitle, columns, rows, filename, orientation = "p" }) {
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setFontSize(9);
  doc.setTextColor(128);
  doc.text("AppleStore Mini", margin, 10);
  doc.text(new Date().toLocaleDateString("vi-VN"), pageWidth - margin, 10, { align: "right" });

  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(title, pageWidth / 2, 22, { align: "center" });

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(subtitle, pageWidth / 2, 29, { align: "center" });
  }

  const head = [columns.map((c) => c.label)];
  const body = rows.map((row) => columns.map((c) => formatCellValue(row[c.key], c.format)));

  doc.autoTable({
    startY: subtitle ? 33 : 27,
    margin: { left: margin, right: margin },
    head,
    body,
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    columnStyles: columns.reduce((acc, c, i) => {
      if (c.format === "currency") acc[i] = { halign: "right" };
      if (c.format === "date") acc[i] = { halign: "center" };
      return acc;
    }, {}),
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(`Trang ${doc.internal.getCurrentPageInfo().pageNumber} / ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, { align: "right" });
    },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/**
 * sections: [{ type: "title", text }, { type: "table", title, columns, rows }]
 */
export async function exportDashboardPDF({ sections, filename }) {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 12;

  doc.setFontSize(9);
  doc.setTextColor(128);
  doc.text("AppleStore Mini — Báo cáo tổng hợp", margin, y);
  doc.text(new Date().toLocaleDateString("vi-VN"), pageWidth - margin, y, { align: "right" });
  y += 8;

  for (const section of sections) {
    if (section.type === "title") {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text(section.text, margin, y);
      y += 7;
    } else if (section.type === "table") {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(section.title, margin, y);
      y += 5;

      const head = [section.columns.map((c) => c.label)];
      const body = section.rows.map((row) => section.columns.map((c) => formatCellValue(row[c.key], c.format)));

      doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head,
        body,
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 8 },
        bodyStyles: { fontSize: 7, cellPadding: 1.5 },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        columnStyles: section.columns.reduce((acc, c, i) => {
          if (c.format === "currency") acc[i] = { halign: "right" };
          return acc;
        }, {}),
        didDrawPage: () => {
          const pc = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(`Trang ${doc.internal.getCurrentPageInfo().pageNumber} / ${pc}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, { align: "right" });
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/exportUtils.js
git commit -m "feat: add Excel/PDF export utilities (SheetJS + jsPDF)"
```

---

### Task 3: Create useExport hook

**Files:**
- Create: `src/hooks/useExport.js`

- [ ] **Step 1: Create `src/hooks/useExport.js`**

```js
import { useState, useCallback } from "react";
import { exportToExcel, exportToPDF, exportDashboardPDF } from "@/utils/exportUtils";
import { toast } from "sonner";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (fn, config) => {
    setIsExporting(true);
    try {
      await fn(config);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Xuất file thất bại");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportExcel = useCallback((config) => handleExport(exportToExcel, config), [handleExport]);
  const exportPDF = useCallback((config) => handleExport(exportToPDF, config), [handleExport]);
  const exportDashboardPDFFn = useCallback((config) => handleExport(exportDashboardPDF, config), [handleExport]);

  return { exportExcel, exportPDF, exportDashboardPDF: exportDashboardPDFFn, isExporting };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useExport.js
git commit -m "feat: add useExport hook"
```

---

### Task 4: Create ExportButton component

**Files:**
- Create: `src/components/ui/export-button.jsx`

- [ ] **Step 1: Create `src/components/ui/export-button.jsx`**

```jsx
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExportButton({ onExportExcel, onExportPDF, loading, disabled }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full" disabled={disabled || loading}>
          <Download className="mr-1.5 h-4 w-4" />
          {loading ? "Đang xuất..." : "Xuất file"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExportExcel && (
          <DropdownMenuItem onClick={onExportExcel} disabled={loading}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Excel (.xlsx)
          </DropdownMenuItem>
        )}
        {onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF} disabled={loading}>
            <FileText className="mr-2 h-4 w-4 text-red-600" />
            PDF (.pdf)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/export-button.jsx
git commit -m "feat: add ExportButton dropdown component"
```

---

### Task 5: Add export to AdminOrderList (orders table)

**Files:**
- Modify: `src/features/admin/components/orders/AdminOrderTable.jsx`

- [ ] **Step 1: Add imports to AdminOrderTable.jsx**

Add at top of the file after the last existing import:

```js
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

Add after the `useUpdateOrderStatusMutation` line (after line ~84):

```js
const { exportExcel, exportPDF, isExporting } = useExport();
```

Add after the `handleUpdateStatus` function:

```js
const STATUS_LABELS = {
  pending: "Chờ xác nhận", confirmed: "Đã xác nhận", processing: "Đang xử lý",
  shipping: "Đang giao hàng", delivered: "Đã giao hàng", cancelled: "Đã huỷ",
  refunding: "Đang hoàn tiền", refunded: "Đã hoàn tiền",
};
const PAYMENT_LABELS = {
  cod: "COD", momo: "MoMo", vnpay: "VNPay", zalopay: "ZaloPay",
  bank_transfer: "Chuyển khoản",
};

const orderColumns = [
  { key: "code", label: "Mã ĐH" },
  { key: "customerName", label: "Khách hàng" },
  { key: "phone", label: "SĐT" },
  { key: "createdAt", label: "Ngày tạo", format: "date" },
  { key: "status", label: "Trạng thái" },
  { key: "paymentMethod", label: "Thanh toán" },
  { key: "isPaid", label: "TT" },
  { key: "totalAmount", label: "Tổng tiền", format: "currency" },
  { key: "discountAmount", label: "Giảm giá", format: "currency" },
  { key: "shippingFee", label: "Phí ship", format: "currency" },
];

const getOrderExportRows = () => orders.map((o) => ({
  code: `#${o.code}`,
  customerName: o.user?.fullName || "—",
  phone: o.user?.phone || "—",
  createdAt: o.createdAt,
  status: STATUS_LABELS[o.status?.toLowerCase()] || o.status,
  paymentMethod: PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod || "—",
  isPaid: o.isPaid ? "Đã TT" : "Chưa TT",
  totalAmount: o.totalAmount || 0,
  discountAmount: o.discountAmount || 0,
  shippingFee: o.shippingFee || 0,
}));

const handleExportOrdersExcel = () => {
  if (orders.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "DonHang", columns: orderColumns, rows: getOrderExportRows() }], filename: `DonHang_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportOrdersPDF = () => {
  if (orders.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Danh sách đơn hàng", columns: orderColumns, rows: getOrderExportRows(), filename: `DonHang_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the filters row**

Replace the filters `<div className="flex flex-wrap items-center gap-3">` section — add the ExportButton inside it after the Select (after the `</Select>` closing tag), wrapping both sides:

Change from:
```jsx
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          ...
        </div>
        <Select ...>...</Select>
      </div>
```

To:
```jsx
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          ...
        </div>
        <Select ...>...</Select>
        <div className="flex-1" />
        <ExportButton
          onExportExcel={handleExportOrdersExcel}
          onExportPDF={handleExportOrdersPDF}
          loading={isExporting}
          disabled={isLoading}
        />
      </div>
```

- [ ] **Step 4: Add toast import if not already present**

The file already imports `toast` from sonner, so no change needed.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/orders/AdminOrderTable.jsx
git commit -m "feat: add Excel/PDF export to AdminOrderTable"
```

---

### Task 6: Add export to AdminOrderDetail (single order PDF)

**Files:**
- Modify: `src/features/admin/components/orders/AdminOrderDetail.jsx`

- [ ] **Step 1: Add imports**

After the last import, add:

```js
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

After the `handleReject` function (around line 60-70), add:

```js
const { exportPDF, isExporting } = useExport();

const handleExportOrderPDF = () => {
  if (!order) return;

  const items = order.items || [];
  const STATUS_LABELS = {
    pending: "Chờ xác nhận", confirmed: "Đã xác nhận", processing: "Đang xử lý",
    shipping: "Đang giao hàng", delivered: "Đã giao hàng", cancelled: "Đã huỷ",
    refunding: "Đang hoàn tiền", refunded: "Đã hoàn tiền",
  };
  const PAYMENT_LABELS = {
    cod: "COD", momo: "MoMo", vnpay: "VNPay", zalopay: "ZaloPay",
    bank_transfer: "Chuyển khoản",
  };

  const itemColumns = [
    { key: "name", label: "Sản phẩm" },
    { key: "variant", label: "Biến thể" },
    { key: "quantity", label: "SL" },
    { key: "price", label: "Đơn giá", format: "currency" },
    { key: "total", label: "Thành tiền", format: "currency" },
  ];

  const itemRows = items.map((it) => {
    const variantParts = [it.color, it.storage, it.ram].filter(Boolean);
    return {
      name: it.name || "—",
      variant: variantParts.length > 0 ? variantParts.join(" / ") : "—",
      quantity: it.quantity,
      price: it.price || 0,
      total: (it.price || 0) * (it.quantity || 0),
    };
  });

  const { jsPDF: JsPDF } = require("jspdf");
  require("jspdf-autotable");
  const doc = new JsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  let y = 12;

  doc.setFontSize(9); doc.setTextColor(128);
  doc.text("AppleStore Mini", m, y);
  doc.text(new Date().toLocaleDateString("vi-VN"), pw - m, y, { align: "right" });
  y += 10;

  doc.setFontSize(16); doc.setTextColor(30, 64, 175);
  doc.text(`\u0110\u01A1n h\xE0ng #${order.code}`, pw / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10); doc.setTextColor(80);
  doc.text(`Kh\xE1ch h\xE0ng: ${order.user?.fullName || "\u2014"}`, m, y); y += 5;
  doc.text(`Email: ${order.user?.email || "\u2014"}`, m, y); y += 5;
  doc.text(`S\u0110T: ${order.user?.phone || "\u2014"}`, m, y); y += 5;
  doc.text(`Ng\xE0y \u0111\u1EB7t: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`, m, y); y += 5;
  doc.text(`Tr\u1EA1ng th\xE1i: ${STATUS_LABELS[order.status?.toLowerCase()] || order.status}`, m, y); y += 5;
  doc.text(`Thanh to\xE1n: ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "\u2014"}${order.isPaid ? " (\u0110\xE3 TT)" : " (Ch\u01B0a TT)"}`, m, y);
  y += 10;

  if (order.shippingAddress || order.address) {
    const addr = order.shippingAddress || order.address;
    doc.setFontSize(10); doc.setTextColor(80);
    doc.text(`\u0110\u1ECBa ch\u1EC9 giao: ${typeof addr === "string" ? addr : [addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}`, m, y);
    y += 8;
  }

  doc.autoTable({
    startY: y, margin: { left: m, right: m },
    head: [itemColumns.map((c) => c.label)],
    body: itemRows.map((r) => itemColumns.map((c) => {
      const v = r[c.key];
      return c.format === "currency" ? Number(v).toLocaleString("vi-VN") : (v ?? "—");
    })),
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(10); doc.setTextColor(80);
  doc.text(`T\u1EA1m t\xEDnh: ${(order.subtotal || 0).toLocaleString("vi-VN")} \u0111`, pw - m, y, { align: "right" }); y += 5;
  if (order.discountAmount) {
    doc.setTextColor(200, 0, 0);
    doc.text(`Gi\u1EA3m gi\xE1: -${(order.discountAmount).toLocaleString("vi-VN")} \u0111`, pw - m, y, { align: "right" }); y += 5;
  }
  if (order.shippingFee) {
    doc.setTextColor(80);
    doc.text(`Ph\xED ship: ${(order.shippingFee).toLocaleString("vi-VN")} \u0111`, pw - m, y, { align: "right" }); y += 5;
  }
  doc.setFontSize(12); doc.setTextColor(30, 64, 175);
  doc.text(`T\u1ED5ng c\u1ED9ng: ${(order.totalAmount || 0).toLocaleString("vi-VN")} \u0111`, pw - m, y, { align: "right" });

  doc.save(`DonHang_${order.code}.pdf`);
};
```

Wait — the `require` won't work in an ES module project. Let me fix this below.

- [ ] **Step 2 (revised): Add export logic inside the component**

After the `handleReject` function, add:

```js
const { exportPDF, isExporting } = useExport();

const handleExportOrderPDF = () => {
  if (!order) return;

  const items = order.items || [];
  const STATUS_LABELS = {
    pending: "Chờ xác nhận", confirmed: "Đã xác nhận", processing: "Đang xử lý",
    shipping: "Đang giao hàng", delivered: "Đã giao hàng", cancelled: "Đã huỷ",
    refunding: "Đang hoàn tiền", refunded: "Đã hoàn tiền",
  };
  const PAYMENT_LABELS = {
    cod: "COD", momo: "MoMo", vnpay: "VNPay", zalopay: "ZaloPay",
    bank_transfer: "Chuyển khoản",
  };

  const itemColumns = [
    { key: "name", label: "Sản phẩm" },
    { key: "variant", label: "Biến thể" },
    { key: "quantity", label: "SL" },
    { key: "price", label: "Đơn giá", format: "currency" },
    { key: "total", label: "Thành tiền", format: "currency" },
  ];

  const itemRows = items.map((it) => {
    const variantParts = [it.color, it.storage, it.ram].filter(Boolean);
    return {
      name: it.name || "—",
      variant: variantParts.length > 0 ? variantParts.join(" / ") : "—",
      quantity: it.quantity,
      price: it.price || 0,
      total: (it.price || 0) * (it.quantity || 0),
    };
  });

  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  let y = 12;

  doc.setFontSize(9); doc.setTextColor(128);
  doc.text("AppleStore Mini", m, y);
  doc.text(new Date().toLocaleDateString("vi-VN"), pw - m, y, { align: "right" });
  y += 10;

  doc.setFontSize(16); doc.setTextColor(30, 64, 175);
  doc.text(`\u0110\u01A1n h\xE0ng #${order.code}`, pw / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10); doc.setTextColor(80);
  doc.text(`Khách hàng: ${order.user?.fullName || "\u2014"}`, m, y); y += 5;
  doc.text(`Email: ${order.user?.email || "\u2014"}`, m, y); y += 5;
  doc.text(`SĐT: ${order.user?.phone || "\u2014"}`, m, y); y += 5;
  doc.text(`Ngày đặt: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`, m, y); y += 5;
  doc.text(`Trạng thái: ${STATUS_LABELS[order.status?.toLowerCase()] || order.status}`, m, y); y += 5;
  doc.text(`Thanh toán: ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "\u2014"}${order.isPaid ? " (Đã TT)" : " (Chưa TT)"}`, m, y);
  y += 10;

  if (order.shippingAddress || order.address) {
    const addr = order.shippingAddress || order.address;
    doc.setFontSize(10); doc.setTextColor(80);
    doc.text(`Địa chỉ giao: ${typeof addr === "string" ? addr : [addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}`, m, y);
    y += 8;
  }

  doc.autoTable({
    startY: y, margin: { left: m, right: m },
    head: [itemColumns.map((c) => c.label)],
    body: itemRows.map((r) => itemColumns.map((c) => {
      const v = r[c.key];
      return c.format === "currency" ? Number(v).toLocaleString("vi-VN") : (v ?? "—");
    })),
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(10); doc.setTextColor(80);
  doc.text(`Tạm tính: ${(order.subtotal || 0).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" }); y += 5;
  if (order.discountAmount) {
    doc.setTextColor(200, 0, 0);
    doc.text(`Giảm giá: -${(order.discountAmount).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" }); y += 5;
  }
  if (order.shippingFee) {
    doc.setTextColor(80);
    doc.text(`Phí ship: ${(order.shippingFee).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" }); y += 5;
  }
  doc.setFontSize(12); doc.setTextColor(30, 64, 175);
  doc.text(`Tổng cộng: ${(order.totalAmount || 0).toLocaleString("vi-VN")} đ`, pw - m, y, { align: "right" });

  doc.save(`DonHang_${order.code}.pdf`);
};
```

- [ ] **Step 3: Add jsPDF import**

Change the import section: add `import { jsPDF } from "jspdf"` after the existing `AdminOrderStatusUpdate` import or among the react-hook-form imports. Add `import "jspdf-autotable"` on the next line.

Add these lines after the existing form/libs imports:
```js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
```

- [ ] **Step 4: Add ExportButton to the page**

In `AdminOrderDetail.jsx` (the component, not the page), find the header section (around lines 100-120 that render the order code and status). Add the ExportButton. Since the component render structure varies, add it in a flex row near the top heading area.

Look for the area where the order code/status badge is displayed. Add:

```jsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    {/* existing order code + status badge code */}
  </div>
  <ExportButton
    onExportPDF={handleExportOrderPDF}
    loading={isExporting}
  />
</div>
```

Exact location: After line ~115 where the order header is rendered. The existing code has something like:

```jsx
<div className="flex items-center gap-3">
  <h2 className="text-lg font-semibold">#{order.code}</h2>
  <OrderStatusBadge status={order.status} />
</div>
```

Wrap it with a flex justify-between container and add ExportButton.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/orders/AdminOrderDetail.jsx
git commit -m "feat: add PDF export for single order detail"
```

---

### Task 7: Add export to AdminProductTable

**Files:**
- Modify: `src/features/admin/components/products/AdminProductTable.jsx`

- [ ] **Step 1: Add imports**

```js
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic**

After the `handleDelete` function, add:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const productColumns = [
  { key: "name", label: "Tên sản phẩm" },
  { key: "category", label: "Danh mục" },
  { key: "price", label: "Giá gốc", format: "currency" },
  { key: "salePrice", label: "Giá KM", format: "currency" },
  { key: "stock", label: "Tồn kho" },
  { key: "soldCount", label: "Đã bán" },
  { key: "status", label: "Trạng thái" },
  { key: "variants", label: "Biến thể" },
];

const getProductExportRows = () => products.map((p) => ({
  name: p.name,
  category: p.category || "—",
  price: p.price || 0,
  salePrice: p.salePrice && p.salePrice < p.price ? p.salePrice : null,
  stock: p.stock ?? 0,
  soldCount: p.soldCount || 0,
  status: p.inStock ? "Đang bán" : "Ngừng bán",
  variants: (p.variants || []).map((v) => {
    const parts = [v.color, v.storage, v.ram].filter(Boolean);
    return `${parts.join(" ")} (Tồn: ${v.stock})`;
  }).join("; ") || "—",
}));

const handleExportProductsExcel = () => {
  if (products.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "SanPham", columns: productColumns, rows: getProductExportRows() }], filename: `SanPham_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportProductsPDF = () => {
  if (products.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Danh sách sản phẩm", columns: productColumns, rows: getProductExportRows(), filename: `SanPham_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the toolbar**

In the toolbar `<div className="flex flex-wrap items-center justify-between gap-3">`, add ExportButton between the filter controls and the Add button:

```jsx
<div className="flex items-center gap-3">
  <ExportButton
    onExportExcel={handleExportProductsExcel}
    onExportPDF={handleExportProductsPDF}
    loading={isExporting}
    disabled={isLoading}
  />
</div>
```

Insert this `<div>` right before the existing `<Button className="rounded-full" asChild>` (the "Thêm sản phẩm" button).

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/products/AdminProductTable.jsx
git commit -m "feat: add Excel/PDF export to AdminProductTable"
```

---

### Task 8: Add export to AdminUserTable

**Files:**
- Modify: `src/features/admin/components/users/AdminUserTable.jsx`

- [ ] **Step 1: Add imports**

```js
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic**

After the `handleDelete` function, add:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const userColumns = [
  { key: "fullName", label: "Họ tên" },
  { key: "email", label: "Email" },
  { key: "phone", label: "SĐT" },
  { key: "role", label: "Vai trò" },
  { key: "isBlocked", label: "Trạng thái" },
  { key: "totalSpent", label: "Tổng chi tiêu", format: "currency" },
  { key: "orderCount", label: "Số đơn" },
  { key: "points", label: "Điểm" },
  { key: "createdAt", label: "Ngày tạo", format: "date" },
];

const getUsersExportRows = () => users.map((u) => ({
  fullName: u.fullName || "—",
  email: u.email || "—",
  phone: u.phone || "—",
  role: ROLE_LABEL[u.role] || u.role,
  isBlocked: u.isBlocked ? "Đã khoá" : "Đang hoạt động",
  totalSpent: u.totalSpent || 0,
  orderCount: u.orderCount ?? 0,
  points: u.points ?? 0,
  createdAt: u.createdAt,
}));

const handleExportUsersExcel = () => {
  if (users.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "NguoiDung", columns: userColumns, rows: getUsersExportRows() }], filename: `NguoiDung_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportUsersPDF = () => {
  if (users.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Danh sách người dùng", columns: userColumns, rows: getUsersExportRows(), filename: `NguoiDung_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the filters row**

In the filters `<div className="flex flex-wrap items-center gap-3">`, add a spacer and the ExportButton after the Select:

```jsx
<div className="flex-1" />
<ExportButton
  onExportExcel={handleExportUsersExcel}
  onExportPDF={handleExportUsersPDF}
  loading={isExporting}
  disabled={isLoading}
/>
```

These go right after the `</Select>` closing tag, before the closing `</div>` of the filters row.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/users/AdminUserTable.jsx
git commit -m "feat: add Excel/PDF export to AdminUserTable"
```

---

### Task 9: Add export to AdminReturnList

**Files:**
- Modify: `src/pages/admin/AdminReturnList.jsx`

- [ ] **Step 1: Add imports**

```js
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic**

After the `handleReject` function, add:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const returnColumns = [
  { key: "orderCode", label: "Mã ĐH" },
  { key: "customerName", label: "Khách hàng" },
  { key: "reason", label: "Lý do" },
  { key: "refundAmount", label: "Số tiền hoàn", format: "currency" },
  { key: "status", label: "Trạng thái" },
  { key: "adminNote", label: "Ghi chú" },
  { key: "createdAt", label: "Ngày yêu cầu", format: "date" },
];

const getReturnExportRows = () => returns.map((ret) => ({
  orderCode: `#${ret.order?.code || "—"}`,
  customerName: ret.user?.fullName || "—",
  reason: RETURN_REASON_MAP[ret.reason] || ret.reason,
  refundAmount: ret.refundAmount || 0,
  status: RETURN_REQUEST_STATUS_MAP[ret.status] || ret.status,
  adminNote: ret.adminNote || "—",
  createdAt: ret.createdAt,
}));

const handleExportReturnsExcel = () => {
  if (returns.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "TraHang", columns: returnColumns, rows: getReturnExportRows() }], filename: `TraHang_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportReturnsPDF = () => {
  if (returns.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Danh sách yêu cầu trả hàng", columns: returnColumns, rows: getReturnExportRows(), filename: `TraHang_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the filters row**

In the filters `<div className="flex flex-wrap items-center gap-3">`, after the Select:

```jsx
<div className="flex-1" />
<ExportButton
  onExportExcel={handleExportReturnsExcel}
  onExportPDF={handleExportReturnsPDF}
  loading={isExporting}
  disabled={isLoading}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminReturnList.jsx
git commit -m "feat: add Excel/PDF export to AdminReturnList"
```

---

### Task 10: Add export to AdminCouponList

**Files:**
- Modify: `src/features/admin/components/coupons/AdminCouponList.jsx`

- [ ] **Step 1: Add imports**

```js
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic**

After the `handleDelete` function, add:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const couponColumns = [
  { key: "code", label: "Mã" },
  { key: "description", label: "Mô tả" },
  { key: "discountType", label: "Loại giảm" },
  { key: "discountValue", label: "Giá trị" },
  { key: "minOrderAmount", label: "Đơn tối thiểu", format: "currency" },
  { key: "usedCount", label: "Đã dùng / Tối đa" },
  { key: "expiresAt", label: "HSD", format: "date" },
  { key: "isActive", label: "Trạng thái" },
];

const DISCOUNT_TYPE_LABELS = { PERCENT: "%", FIXED: "VNĐ" };

const getCouponExportRows = () => coupons.map((c) => ({
  code: c.code,
  description: c.description || "—",
  discountType: DISCOUNT_TYPE_LABELS[c.discountType] || c.discountType,
  discountValue: c.discountType === "PERCENT"
    ? `${c.discountValue}% (tối đa ${(c.maxDiscountAmount || 0).toLocaleString("vi-VN")}đ)`
    : `${(c.discountValue || 0).toLocaleString("vi-VN")}đ`,
  minOrderAmount: c.minOrderAmount || 0,
  usedCount: `${c.usedCount || 0} / ${c.maxUsage || "∞"}`,
  expiresAt: c.expiresAt,
  isActive: c.isActive ? "Đang kích hoạt" : "Đã tắt",
}));

const handleExportCouponsExcel = () => {
  if (coupons.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "Coupon", columns: couponColumns, rows: getCouponExportRows() }], filename: `Coupon_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportCouponsPDF = () => {
  if (coupons.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Danh sách mã giảm giá", columns: couponColumns, rows: getCouponExportRows(), filename: `Coupon_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the toolbar**

Look for the area with the "Thêm mã giảm giá" button (around line 120-140 in the render section). In the toolbar `<div>` above the table, add:

```jsx
<ExportButton
  onExportExcel={handleExportCouponsExcel}
  onExportPDF={handleExportCouponsPDF}
  loading={isExporting}
  disabled={isLoading}
/>
```

Place it before the "Thêm mã giảm giá" button.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/coupons/AdminCouponList.jsx
git commit -m "feat: add Excel/PDF export to AdminCouponList"
```

---

### Task 11: Add export to Dashboard child components

Each dashboard section component gets its own ExportButton, managing its own data export.

---

#### 11a: RevenueChart export

**Files:**
- Modify: `src/features/admin/components/dashboard/RevenueChart.jsx`

- [ ] **Step 1: Add imports at top**

```js
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

Add right after the `useGetRevenueStatsQuery` and `period` state:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const revenueColumns = [
  { key: "label", label: period === "year" ? "Tháng" : "Ngày" },
  { key: "revenue", label: "Doanh thu", format: "currency" },
  { key: "orders", label: "Đơn hàng" },
];

const handleExportRevenueExcel = () => {
  const rows = data?.chart || [];
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "DoanhThu", columns: revenueColumns, rows }], filename: `DoanhThu_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportRevenuePDF = () => {
  const rows = data?.chart || [];
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Báo cáo doanh thu", columns: revenueColumns, rows, filename: `DoanhThu_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the JSX**

Change the period toggle row from:
```jsx
<div className="flex items-center gap-1.5">
  {PERIODS.map(...)}
</div>
```
To:
```jsx
<div className="flex items-center justify-between gap-1.5">
  <div className="flex items-center gap-1.5">
    {PERIODS.map(...)}
  </div>
  <ExportButton onExportExcel={handleExportRevenueExcel} onExportPDF={handleExportRevenuePDF} loading={isExporting} />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/dashboard/RevenueChart.jsx
git commit -m "feat: add Excel/PDF export to RevenueChart"
```

---

#### 11b: OrderStats export

**Files:**
- Modify: `src/features/admin/components/dashboard/OrderStats.jsx`

- [ ] **Step 1: Add imports at top**

```js
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

Add after the `useGetOrderStatsQuery({ period })` call:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const orderStatsColumns = [
  { key: "label", label: period === "year" ? "Tháng" : period === "week" ? "Ngày" : "Ngày" },
  { key: "orders", label: "Đơn hàng" },
  { key: "revenue", label: "Doanh thu", format: "currency" },
  { key: "avgPerDay", label: "TB/ngày", format: "currency" },
];

const handleExportOrderStatsExcel = () => {
  if (data.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "ThongKeDH", columns: orderStatsColumns, rows: data }], filename: `ThongKeDH_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportOrderStatsPDF = () => {
  if (data.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Thống kê đơn hàng", columns: orderStatsColumns, rows: data, filename: `ThongKeDH_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the JSX**

Change the period toggle row from `<div className="flex gap-1.5">` to a justify-between layout wrapping the toggle and ExportButton:

```jsx
<div className="flex items-center justify-between gap-1.5">
  <div className="flex gap-1.5">
    {PERIODS.map(...)}
  </div>
  <ExportButton onExportExcel={handleExportOrderStatsExcel} onExportPDF={handleExportOrderStatsPDF} loading={isExporting} />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/dashboard/OrderStats.jsx
git commit -m "feat: add Excel/PDF export to OrderStats"
```

---

#### 11c: TopProducts export

**Files:**
- Modify: `src/features/admin/components/dashboard/TopProducts.jsx`

- [ ] **Step 1: Add imports at top**

```js
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

Add after `useGetTopProductsQuery`:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const topProdColumns = [
  { key: "index", label: "#" },
  { key: "name", label: "Tên sản phẩm" },
  { key: "price", label: "Giá", format: "currency" },
  { key: "soldCount", label: "Đã bán" },
  { key: "inStock", label: "Còn hàng" },
];

const getTopProdExportRows = () => data.map((p, i) => ({
  index: i + 1,
  name: p.name,
  price: p.price || 0,
  soldCount: p.soldCount || 0,
  inStock: p.inStock ? "Có" : "Hết",
}));

const handleExportTopProdExcel = () => {
  const rows = getTopProdExportRows();
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "TopSP", columns: topProdColumns, rows }], filename: `TopSP_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportTopProdPDF = () => {
  const rows = getTopProdExportRows();
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Sản phẩm bán chạy", columns: topProdColumns, rows, filename: `TopSP_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the JSX**

Change the period toggle row to justify-between:

```jsx
<div className="flex items-center justify-between gap-1.5">
  <div className="flex gap-1.5">
    {PERIODS.map(...)}
  </div>
  <ExportButton onExportExcel={handleExportTopProdExcel} onExportPDF={handleExportTopProdPDF} loading={isExporting} />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/dashboard/TopProducts.jsx
git commit -m "feat: add Excel/PDF export to TopProducts"
```

---

#### 11d: SlowProducts export

**Files:**
- Modify: `src/features/admin/components/dashboard/SlowProducts.jsx`

- [ ] **Step 1: Add imports at top**

```js
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

Add after `useGetSlowProductsQuery`:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const slowProdColumns = [
  { key: "index", label: "#" },
  { key: "name", label: "Tên sản phẩm" },
  { key: "price", label: "Giá", format: "currency" },
  { key: "totalStock", label: "Tồn kho" },
  { key: "soldCount", label: "Đã bán 30 ngày" },
];

const getSlowProdExportRows = () => data.map((p, i) => ({
  index: i + 1,
  name: p.name,
  price: p.price || 0,
  totalStock: p.totalStock ?? 0,
  soldCount: p.soldCount ?? 0,
}));

const handleExportSlowProdExcel = () => {
  const rows = getSlowProdExportRows();
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "SPCham", columns: slowProdColumns, rows }], filename: `SPCham_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportSlowProdPDF = () => {
  const rows = getSlowProdExportRows();
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Sản phẩm bán chậm (30 ngày)", columns: slowProdColumns, rows, filename: `SPCham_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the JSX**

Wrap the list in a container and add ExportButton at top. The component returns the product list directly. Add a wrapper div at the top of the return:

```jsx
return (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{data.length} sản phẩm</span>
      <ExportButton onExportExcel={handleExportSlowProdExcel} onExportPDF={handleExportSlowProdPDF} loading={isExporting} />
    </div>
    <div className="space-y-1">
      {data.map(...)}
    </div>
  </div>
);
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/dashboard/SlowProducts.jsx
git commit -m "feat: add Excel/PDF export to SlowProducts"
```

---

#### 11e: TopCustomers export

**Files:**
- Modify: `src/features/admin/components/dashboard/TopCustomers.jsx`

- [ ] **Step 1: Add imports at top**

```js
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
```

- [ ] **Step 2: Add export logic inside the component**

Add after `useGetTopCustomersQuery`:

```js
const { exportExcel, exportPDF, isExporting } = useExport();

const custColumns = [
  { key: "index", label: "#" },
  { key: "fullName", label: "Họ tên" },
  { key: "email", label: "Email" },
  { key: "totalSpent", label: "Tổng chi tiêu", format: "currency" },
  { key: "orderCount", label: "Số đơn" },
];

const getCustExportRows = () => data.map((c, i) => ({
  index: i + 1,
  fullName: c.fullName || "—",
  email: c.email || "—",
  totalSpent: c.totalSpent || 0,
  orderCount: c.orderCount || 0,
}));

const handleExportCustExcel = () => {
  const rows = getCustExportRows();
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportExcel({ sheets: [{ name: "TopKH", columns: custColumns, rows }], filename: `TopKH_${new Date().toISOString().slice(0, 10)}` });
};

const handleExportCustPDF = () => {
  const rows = getCustExportRows();
  if (rows.length === 0) { toast("Không có dữ liệu để xuất"); return; }
  exportPDF({ title: "Khách hàng chi tiêu cao", columns: custColumns, rows, filename: `TopKH_${new Date().toISOString().slice(0, 10)}` });
};
```

- [ ] **Step 3: Add ExportButton in the JSX**

Wrap in a container and add ExportButton at top:

```jsx
return (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{data.length} khách hàng</span>
      <ExportButton onExportExcel={handleExportCustExcel} onExportPDF={handleExportCustPDF} loading={isExporting} />
    </div>
    <div className="space-y-3">
      {data.map(...)}
    </div>
  </div>
);
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/components/dashboard/TopCustomers.jsx
git commit -m "feat: add Excel/PDF export to TopCustomers"
```

---

### Task 12: Final verification

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Fix any warnings/errors.

- [ ] **Step 2: Verify build works**

```bash
npm run build
```

Expected: build succeeds without errors.

- [ ] **Step 3: Verify all new files exist**

```bash
ls src/utils/exportUtils.js src/hooks/useExport.js src/components/ui/export-button.jsx
```

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup, lint fixes"
```

- [ ] **Step 5: Push**

```bash
git push
```<｜end▁of▁thinking｜>

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="read">
<｜｜DSML｜｜parameter name="filePath" string="true">D:\AppleStoreMini\src\features\admin\components\dashboard\RevenueChart.jsx