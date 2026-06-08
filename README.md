# AppleStoreMini

AppleStoreMini là website bán sản phẩm Apple gồm frontend React/Vite và backend Node.js/Express/Prisma. Dự án có các luồng chính: xem sản phẩm, giỏ hàng, đặt hàng COD/VNPay, tài khoản người dùng, yêu thích, đánh giá, tin tức và trang quản trị.

## Cấu trúc source

- `D:\AppleStoreMini`: frontend React/Vite.
- `D:\AppleStoreMini_Api`: backend Node.js/Express/Prisma.

## Chạy frontend

```bash
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Chạy backend

Tạo file `.env` trong `D:\AppleStoreMini_Api` dựa trên `.env.example`, sau đó chạy:

```bash
npm install
npx prisma generate
npm run dev
```

Backend mặc định chạy tại `http://localhost:5000`.

## Cấu hình AI

AI sử dụng Groq API từ backend. API key không nhập trực tiếp trong giao diện admin để tránh lộ khóa khi demo, nộp source hoặc deploy.

Các biến môi trường cần cấu hình trong `D:\AppleStoreMini_Api\.env`:

```env
GROQ_API_KEY=your_groq_api_key
AI_MODEL_NAME=llama-3.3-70b-versatile
AI_MAX_TOKENS=1200
AI_TEMPERATURE=0.5
AI_TIMEOUT_MS=20000
```

Khi đổi API key hoặc model, lưu file `.env` rồi restart backend. Trang admin `Cấu hình AI` chỉ dùng để bật/tắt AI toàn hệ thống, bật/tắt từng tính năng, test kết nối và xem nhật ký AI.

## Kiểm tra

```bash
npm run lint
npm run build
```

Một số kiểm tra contract đang dùng Node test:

```bash
node --test tests\adminAiManagementContract.test.mjs
```
