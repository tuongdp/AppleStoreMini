import type { FullConfig } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { createServer, type ViteDevServer } from "vite";

const DEFAULT_BASE_URL = "http://localhost:5173";

async function isReachable(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

function getBaseUrl(config: FullConfig) {
  const configured = config.projects
    .map((project) => project.use.baseURL)
    .find((value): value is string => typeof value === "string" && value.length > 0);

  return configured || process.env.TEST_BASE_URL || DEFAULT_BASE_URL;
}

export default async function globalSetup(config: FullConfig) {
  await mkdir("test-results", { recursive: true });

  if (process.env.PLAYWRIGHT_SKIP_WEBSERVER) return;

  const baseURL = getBaseUrl(config);
  if (await isReachable(baseURL)) return;

  const url = new URL(baseURL);
  const host = url.hostname || "127.0.0.1";
  const port = Number(url.port || 5173);

  const server: ViteDevServer = await createServer({
    server: {
      host,
      port,
      strictPort: true,
    },
  });

  await server.listen();

  return async () => {
    await server.close();
  };
}
