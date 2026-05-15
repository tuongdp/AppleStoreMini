# VAT Invoice Export — Design Spec

**Date:** 2026-05-15  
**Branch:** (current)  
**Status:** Design approved — awaiting implementation plan

---

## Overview

Add VAT invoice (Hóa đơn GTGT) PDF export functionality to both admin and customer order detail pages. Admin/customer enters buyer company info via a dialog, and the system generates a professional Vietnamese-standard VAT invoice PDF with auto-incrementing invoice number, tax calculation, and amount-in-words.

---

## Architecture

```
src/
├── utils/
│   └── invoiceUtils.js              # New: VAT invoice PDF generation + helpers
├── components/
│   └── shared/
│       └── VATInvoiceDialog.jsx     # New: popup to enter buyer info + VAT rate
├── features/
│   ├── admin/
│   │   └── components/
│   │       └── shop/
│   │           └── AdminShopSettings.jsx  # New: form to configure shop info
│   └── orders/
│       └── components/
│           └── OrderDetail.jsx      # Edit: add "Xuất hóa đơn GTGT" button
├── pages/
│   └── admin/
│       └── AdminShopSettings.jsx    # New: page wrapper for /admin/settings/shop
└── routes.jsx                       # Edit: add route /admin/settings/shop
```

Processing flow:

1. Admin/customer opens order detail page → sees "Xuất hóa đơn GTGT" button
2. Clicks button → `VATInvoiceDialog` opens with fields: company name, tax code, address, VAT rate
3. On confirm → `invoiceUtils.exportVATInvoicePDF({ order, buyerInfo, sellerInfo, vatRate })`
4. jsPDF generates A4 invoice → auto-downloads as `HoaDonGTGT_<code>.pdf`
5. Invoice counter increments in localStorage

No new backend endpoints required. All data is client-side (RTK Query cache for orders, localStorage for shop settings and invoice counter).

---

## New Dependencies

None. All already installed:
- `jspdf` v4.2.1 — PDF generation
- `jspdf-autotable` v5.0.7 — table rendering in PDF

---

## Core Modules

### `src/utils/invoiceUtils.js`

**Exports:**

```
exportVATInvoicePDF({ order, buyerInfo, vatRate })
  → void (triggers download)
```

**Internal helpers:**

```
getSellerInfo()
  → reads localStorage key "shop_settings"
  → returns { name, taxCode, address, phone, email }
  → defaults to empty strings if not configured

getNextInvoiceNumber()
  → reads localStorage key "invoice_counter" (int, defaults to 1)
  → formats as "0000123" (7-digit zero-padded)
  → increments counter, saves back to localStorage
  → returns formatted string

generateInvoiceSymbol()
  → returns "ASM/<currentYear>E"
  → E = electronic (hóa đơn điện tử)

numberToWords(n)
  → "12400000" → "Mười hai triệu bốn trăm nghìn đồng"
  → Handles 0 → 999,999,999,999 (tỷ)
  → Vietnamese locale number-to-words
```

**PDF Layout (A4 portrait):**

| Section | Content |
|---------|---------|
| Header left | Seller name (bold), tax code, address, phone |
| Header right | Invoice symbol + number, date |
| Title | "HÓA ĐƠN GIÁ TRỊ GIA TĂNG" centered, blue, bold, 16pt |
| Buyer block | Buyer company name, tax code, address + order code reference |
| Items table | STT, Tên sản phẩm, Đơn vị tính, Số lượng, Đơn giá (đã gồm VAT), Thành tiền (đã gồm VAT) |
| Tax calculation | Cộng tiền (pre-tax), Thuế GTGT (X%), Tổng tiền (post-tax), Chiết khấu |
| Amount in words | "Số tiền bằng chữ: ..." |
| Payment method | COD / MoMo / VNPay / Bank Transfer |
| Footer | Signature blocks: Người mua (left) / Người bán (right) |

**Tax calculation logic:**

```
subtotal = order.totalAmount                     // đã bao gồm VAT (như cart ghi "Đã bao gồm VAT")
priceBeforeTax = subtotal / (1 + vatRate / 100)
vatAmount = subtotal - priceBeforeTax
```

**Styling:**
- Page margin: 15mm
- Table header: `#1e40af` blue, white text (consistent with existing exports)
- Alternating row striping: `#f3f4f6`
- Currency columns: right-aligned
- Grid theme for table borders
- Font: default jsPDF helvetica (built-in, supports Vietnamese characters)

---

### `src/components/shared/VATInvoiceDialog.jsx`

```
Props:
  open: boolean
  onClose: () => void
  order: object          // full order data including user, items, totals
  isExporting: boolean   // loading state (can use useExport hook internally)

State (local):
  companyName: string    // buyer company name
  taxCode: string         // buyer tax ID
  address: string         // buyer company address
  vatRate: number         // 8 | 10 | custom

Behavior:
  - Opens as a Dialog/Modal (shadcn/ui)
  - Required fields: companyName, taxCode (address optional)
  - VAT rate: dropdown with presets [8%, 10%] + "Khác" option to type custom
  - Default VAT rate: 10%
  - "Xuất hóa đơn" button → validates → calls exportVATInvoicePDF → closes dialog
  - Loading state on button while generating
  - If companyName left empty → uses order.user.fullName as individual buyer
```

---

### `src/features/admin/components/shop/AdminShopSettings.jsx`

```
Form fields (all stored in localStorage "shop_settings"):
  - shopName: string      (default: "AppleStore Mini")
  - taxCode: string       (default: "")
  - address: string       (default: "")
  - phone: string         (default: "")
  - email: string         (default: "")

Behavior:
  - Loads existing values from localStorage on mount
  - Save button → writes to localStorage "shop_settings"
  - Validation: all fields required before save
  - Success toast after save
```

---

### `src/pages/admin/AdminShopSettings.jsx`

Simple page wrapper:
```jsx
const AdminShopSettingsPage = () => <AdminShopSettings />
export default AdminShopSettingsPage
```

---

## Modified Files

### `AdminOrderDetail.jsx` (admin side)

- Add "Xuất hóa đơn GTGT" button near existing export controls
- Import and render `<VATInvoiceDialog>` with the order data
- Button variant: outline, icon: receipt/file-text

### `OrderDetail.jsx` (customer side, `src/features/orders/components/`)

- Add "Xuất hóa đơn GTGT" button in the order action area
- Import and render `<VATInvoiceDialog>` with the order data
- Same pattern as admin side

### `src/routes.jsx`

- Add route:
  ```js
  { path: "/admin/settings/shop", element: <AdminShopSettingsPage /> }
  ```
  under the existing admin layout with `AdminRoute` protection

---

## Error Handling

- Empty seller info: toast "Vui lòng cấu hình thông tin cửa hàng trước khi xuất hóa đơn"
- Order data incomplete (no items): toast "Không đủ dữ liệu để xuất hóa đơn"
- PDF generation failure: toast "Xuất hóa đơn thất bại" + console.error
- Missing required buyer fields in dialog: inline validation error on the field

---

## Implementation Order

1. `src/utils/invoiceUtils.js` — core: numberToWords, invoice counter, seller info, PDF generation
2. `src/components/shared/VATInvoiceDialog.jsx` — popup for entering buyer info
3. `src/features/admin/components/shop/AdminShopSettings.jsx` — shop info config form
4. `src/pages/admin/AdminShopSettings.jsx` — page wrapper
5. `src/routes.jsx` — add route
6. `AdminOrderDetail.jsx` — add VAT invoice button (admin)
7. `OrderDetail.jsx` — add VAT invoice button (customer)

---

## Out of Scope

- Integrating with real Vietnamese e-invoice API (hóa đơn điện tử chính thức)
- QR code on invoice
- Invoice history/log page
- Sending invoice via email
- Checkout-level checkbox for requesting VAT invoice
- Backend invoice storage/numbering
- Multi-language invoice
