import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const backendDir = process.env.TEST_BACKEND_DIR || path.resolve(rootDir, "..", "AppleStoreMini_Api");
const frontendUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
const backendUrl = process.env.TEST_BACKEND_URL || "http://127.0.0.1:5000";
const normalizeApiUrl = (value) => {
  const url = new URL(value || `${backendUrl}/api`);
  if (!url.pathname || url.pathname === "/") {
    url.pathname = "/api";
  }
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url.toString();
};
const apiUrl = normalizeApiUrl(process.env.TEST_API_URL);
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";
const useShell = process.platform === "win32";

const children = [];

function spawnLogged(command, args, options) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: useShell,
    ...options,
  });
  children.push(child);
  return child;
}

function killTree(child) {
  if (!child?.pid || child.killed) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t"], { stdio: "ignore" });
    return;
  }
  try {
    child.kill("SIGTERM");
  } catch {
    // Best-effort cleanup only.
  }
}

async function waitFor(url, label, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`${label} was not ready at ${url}: ${lastError}`);
}

async function run(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "inherit", shell: useShell, ...options });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function main() {
  if (!existsSync(path.join(backendDir, "package.json"))) {
    throw new Error(`Backend package.json not found. Set TEST_BACKEND_DIR. Current: ${backendDir}`);
  }

  spawnLogged(npmBin, ["start"], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: process.env.TEST_BACKEND_PORT || "5000",
      CLIENT_URL: frontendUrl,
      FRONTEND_URL: frontendUrl,
    },
  });

  spawnLogged("node", ["./node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5173", "--strictPort"], {
    cwd: rootDir,
    env: {
      ...process.env,
      VITE_API_URL: apiUrl,
    },
  });

  await waitFor(new URL("health", apiUrl).toString(), "Backend API");
  await waitFor(frontendUrl, "Frontend");

  const testArgs = process.env.TEST_FULLSTACK_ARGS
    ? process.env.TEST_FULLSTACK_ARGS.split(" ").filter(Boolean)
    : ["playwright", "test", "tests/e2e", "tests/api", "--project=chromium", "--project=api"];

  const exitCode = await run(npxBin, testArgs, {
    cwd: rootDir,
    env: {
      ...process.env,
      PLAYWRIGHT_SKIP_WEBSERVER: "true",
      TEST_BASE_URL: frontendUrl,
      TEST_BACKEND_URL: backendUrl,
      TEST_API_URL: apiUrl,
    },
  });

  children.forEach(killTree);
  process.exit(exitCode);
}

process.on("exit", () => children.forEach(killTree));
process.on("SIGINT", () => {
  children.forEach(killTree);
  process.exit(130);
});
process.on("SIGTERM", () => {
  children.forEach(killTree);
  process.exit(143);
});

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
