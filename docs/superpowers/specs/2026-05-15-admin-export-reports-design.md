# Admin Export Reports — Design Spec

**Date:** 2026-05-15  
**Branch:** (current)  
**Status:** Design approved — awaiting implementation plan

---

## Overview

Add Excel (.xlsx) and PDF (.pdf) export functionality to the admin panel. Every management page gets an Export dropdown button. Processing is entirely client-side (frontend) using existing RTK Query data.

---

## Architecture

```
src/
├── utils/
│   └── exportUtils.js          # Core: Excel & PDF file generation
├── hooks/
│   └── useExport.js            # Hook: wraps utils + loading/error state
├── components/ui/
│   └── ExportButton.jsx        # Dropdown: Excel | PDF
```

Processing flow:
1. Data from RTK Query cache (no re-fetch)
2. `useExport(data, columns, filename)` formats data
3. `exportUtils.exportToExcel()` via SheetJS → .xlsx download
4. `exportUtils.exportToPDF()` via jsPDF + jspdf-autotable → .pdf download

No new backend endpoints required.

---

## New Dependencies

- `jspdf` — PDF generation
- `jspdf-autotable` — table rendering in PDF

Already installed:
- `xlsx` (SheetJS) v0.18.5 — Excel generation (currently only used for import)

---

## Core Modules

### `src/utils/exportUtils.js`

```
exportToExcel({ sheets, filename })
  sheets: [{ name: string, columns: Column[], rows: Row[] }]
  → Multi-sheet workbook, bold header + background color, currency formatting,
    auto-column-width, auto-filter on headers

exportToPDF({ title, columns, rows, filename, orientation?, subtitle? })
  → Single table PDF with shop header, title, jsPDF autotable
     orientation: 'p' | 'l' (portrait default)

exportDashboardPDF({ sections, filename })
  → Multi-section PDF report combining chart titles + tables
     sections: [{ type: 'title' | 'subtitle' | 'table', title?, columns?, rows? }]
```

Column type:
```
{ key: string, label: string, format?: 'currency' | 'date' | 'number', width?: number }
```

### `src/hooks/useExport.js`

```
const { exportExcel, exportPDF, isExporting } = useExport()

exportExcel(config) → Promise<boolean>
exportPDF(config) → Promise<boolean>
```

Returns `isExporting` boolean for button loading state. Errors are caught internally and shown via sonner toast.

### `src/components/ui/ExportButton.jsx`

Props:
```
onExportExcel: () => void
onExportPDF: () => void
loading: boolean
disabled?: boolean
```

Dropdown button with Download icon. Two items: "Excel (.xlsx)" with sheet icon, "PDF (.pdf)" with file icon.

---

## Per-Page Export Config

### Dashboard (`/admin/dashboard`)

| Section | Export Button | Data Source |
|---------|---------------|-------------|
| Revenue Chart | Excel + PDF: sheet "DoanhThu", columns: Ngày/Tháng, Doanh thu, Đơn hàng, TB/ngày | `getDashboardRevenue`, `getOrderStats` |
| Top Products | Excel sheet "TopSP", PDF: #, Tên SP, Giá, Đã bán, Tồn kho | `getTopProducts` |
| Slow Products | Excel sheet "SPCham", PDF: #, Tên SP, Giá, Tồn kho, Đã bán 30 ngày | `getSlowProducts` |
| Top Customers | Excel sheet "TopKH", PDF: #, Họ tên, Email, Tổng chi tiêu, Số đơn | `getTopCustomers` |
| Dashboard Summary | PDF multi-section: all charts + tables in one report | All dashboard APIs |

### Orders (`/admin/orders`)

| Export | Columns |
|--------|---------|
| Order List (Excel/PDF) | Mã ĐH, Khách hàng, SĐT, Ngày tạo, Trạng thái, Thanh toán, Tổng tiền, Giảm giá, Phí ship |
| Order Detail (PDF only) | Header shop info, Mã ĐH, Customer + Shipping info, Product table (name, color, qty, price), Totals |

### Products (`/admin/products`)

Excel/PDF: Tên SP, Danh mục, Giá gốc, Giá KM, Tổng tồn, Đã bán, Đánh giá, Trạng thái, Biến thể (màu, dung lượng, tồn)

### Users (`/admin/users`)

Excel/PDF: Họ tên, Email, SĐT, Role, Điểm, Tổng chi tiêu, Số đơn, Trạng thái, Ngày tạo

### Returns (`/admin/returns`)

Excel/PDF: Mã ĐH, Khách hàng, Lý do trả, Số tiền hoàn, Trạng thái, Ngày yêu cầu

### Coupons (`/admin/coupons`)

Excel/PDF: Mã coupon, Mô tả, Loại giảm, Giá trị, Đơn tối thiểu, Đã dùng/Tối đa, HSD, Trạng thái

---

## Excel Formatting Standards

- Header row: **bold**, background `#1e40af` (blue-800), white text
- Currency columns: `#,##0` VND format, right-aligned
- Date columns: `dd/mm/yyyy` format
- Auto column width based on content length (capped at 40 chars)
- Auto-filter enabled on header row
- Row striping: alternating white / `#f3f4f6`

---

## PDF Formatting Standards

- Page margin: 15mm
- Shop header: "AppleStore Mini" + date
- Title: bold, 14pt, centered
- Subtitle (optional): 10pt, gray
- Table: jsPDF autotable, striped rows, header `#1e40af` white text
- Footer: page number "Trang X / Y"

---

## Error Handling

- Empty data: show toast "Không có dữ liệu để xuất" and return
- Large dataset (>2000 rows for Excel, >500 for PDF): show toast "Đang tạo file..." then auto-download
- Generation failure: toast error with message, log to console

---

## Implementation Order

1. Install jsPDF + jspdf-autotable
2. Create `src/utils/exportUtils.js` (Excel + PDF functions)
3. Create `src/hooks/useExport.js`
4. Create `src/components/ui/ExportButton.jsx`
5. Add export to each page (in order):
   - AdminOrderList (order list export)
   - AdminOrderDetail (single order PDF)
   - AdminProductList
   - AdminUserList
   - AdminReturnList
   - AdminCouponPage
   - AdminDashboard (revenue, top products, slow products, top customers, summary PDF)

---

## Out of Scope

- Backend-generated exports (all client-side)
- Export for Categories, Banners, Flash Sales, News, Reviews pages (can be added later using same pattern)
- Scheduled/automated email reports
- PDF invoice templates with heavy branding
