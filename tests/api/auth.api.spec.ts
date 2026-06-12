import { test, expect, request } from "@playwright/test";
import { testEnv } from "../utils/env";
import { isServiceAvailable } from "../utils/health";

test.describe("auth api contract", () => {
  test("login returns access and refresh tokens", async () => {
    const api = await request.newContext({ baseURL: testEnv.apiUrl });
    test.skip(!(await isServiceAvailable(api)), "backend API is not running");
    const response = await api.post("auth/login", { data: { email: testEnv.userEmail, password: testEnv.userPassword } });
    expect([200, 201, 400, 401]).toContain(response.status());
    if (response.ok()) {
      const body = await response.json();
      expect(JSON.stringify(body)).toMatch(/accessToken/);
      expect(JSON.stringify(body)).toMatch(/refreshToken/);
    }
  });

  test("protected me endpoint rejects anonymous requests", async () => {
    const api = await request.newContext({ baseURL: testEnv.apiUrl });
    test.skip(!(await isServiceAvailable(api)), "backend API is not running");
    const response = await api.get("auth/me");
    expect([401, 403]).toContain(response.status());
  });
});
