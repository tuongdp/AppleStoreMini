import { test, expect, request } from "@playwright/test";
import crypto from "node:crypto";
import { testEnv } from "../utils/env";
import { isServiceAvailable } from "../utils/health";

function momoSignature(payload: Record<string, string | number>, secret: string) {
  const raw = `accessKey=${payload.accessKey}&amount=${payload.amount}&extraData=${payload.extraData || ""}&message=${payload.message || ""}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo || ""}&orderType=${payload.orderType || ""}&partnerCode=${payload.partnerCode}&payType=${payload.payType || ""}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;
  return crypto.createHmac("sha256", secret).update(raw).digest("hex");
}

test.describe("momo payment webhook contract", () => {
  test("rejects invalid MoMo IPN signature", async () => {
    const api = await request.newContext({ baseURL: testEnv.apiUrl });
    test.skip(!(await isServiceAvailable(api)), "backend API is not running");
    const response = await api.post("payment/momo-ipn", {
      data: {
        partnerCode: "MOMO",
        accessKey: "invalid",
        requestId: "REQ-E2E-INVALID",
        amount: 10000,
        orderId: "ORDER-E2E-INVALID",
        orderInfo: "Invalid signature test",
        orderType: "momo_wallet",
        transId: "TRANS-E2E-INVALID",
        resultCode: 0,
        message: "Successful.",
        payType: "qr",
        responseTime: Date.now(),
        extraData: "",
        signature: "invalid",
      },
    });
    expect([400, 401]).toContain(response.status());
  });

  test("accepts successful MoMo IPN for a seeded order and is idempotent", async () => {
    test.skip(!process.env.MOMO_SECRET_KEY || !process.env.MOMO_ACCESS_KEY, "set MOMO_ACCESS_KEY and MOMO_SECRET_KEY in .env.test");
    test.skip(!process.env.TEST_MOMO_ORDER_CODE, "set TEST_MOMO_ORDER_CODE to a seeded unpaid MoMo order code");

    const api = await request.newContext({ baseURL: testEnv.apiUrl });
    test.skip(!(await isServiceAvailable(api)), "backend API is not running");

    const payload = {
      partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
      accessKey: process.env.MOMO_ACCESS_KEY!,
      requestId: `REQ-E2E-${Date.now()}`,
      amount: Number(process.env.TEST_MOMO_AMOUNT || 10000),
      orderId: process.env.TEST_MOMO_ORDER_CODE!,
      orderInfo: `Thanh toan don hang ${process.env.TEST_MOMO_ORDER_CODE}`,
      orderType: "momo_wallet",
      transId: `TRANS-E2E-${Date.now()}`,
      resultCode: 0,
      message: "Successful.",
      payType: "qr",
      responseTime: Date.now(),
      extraData: "",
    };
    const signedPayload = { ...payload, signature: momoSignature(payload, process.env.MOMO_SECRET_KEY!) };

    const response = await api.post("payment/momo-ipn", { data: signedPayload });
    expect([200, 201]).toContain(response.status());

    const duplicateResponse = await api.post("payment/momo-ipn", { data: signedPayload });
    expect([200, 201]).toContain(duplicateResponse.status());
  });
});
