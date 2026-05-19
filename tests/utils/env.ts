import dotenv from "dotenv";

dotenv.config({ path: ".env.test", quiet: true });
dotenv.config({ quiet: true });

function normalizeApiUrl(value: string) {
  const url = new URL(value);
  if (!url.pathname || url.pathname === "/") {
    url.pathname = "/api";
  }
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url.toString();
}

export const testEnv = {
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:5173",
  apiUrl: normalizeApiUrl(process.env.TEST_API_URL || "http://localhost:5000/api"),
  backendUrl: process.env.TEST_BACKEND_URL || "http://localhost:5000",
  userEmail: process.env.TEST_USER_EMAIL || "e2e.customer@example.com",
  userPassword: process.env.TEST_USER_PASSWORD || "Password@123",
  adminEmail: process.env.TEST_ADMIN_EMAIL || "e2e.admin@example.com",
  adminPassword: process.env.TEST_ADMIN_PASSWORD || "Admin@123",
};
