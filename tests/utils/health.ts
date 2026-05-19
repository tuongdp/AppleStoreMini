import type { APIRequestContext } from "@playwright/test";

export async function isServiceAvailable(api: APIRequestContext) {
  try {
    const response = await api.get("health", { timeout: 3_000 });
    return response.status() < 500 || response.status() === 404;
  } catch {
    return false;
  }
}
