const fs = require("fs");
const path = require("path");
const http = require("http");

const DIST = path.resolve(__dirname, "../dist");
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

const ROUTES = [
  { path: "/", name: "Home" },
  { path: "/products", name: "Products" },
  { path: "/news", name: "News" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/warranty", name: "Warranty" },
  { path: "/return-policy", name: "ReturnPolicy" },
  { path: "/applecare", name: "AppleCare" },
  { path: "/privacy", name: "Privacy" },
  { path: "/terms", name: "Terms" },
];

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, BASE_URL);
      let filePath = path.join(DIST, url.pathname);
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "text/html" });
      try {
        res.end(fs.readFileSync(filePath));
      } catch {
        res.end(fs.readFileSync(path.join(DIST, "index.html")));
      }
    });
    server.listen(PORT, () => {
      console.log(`[prerender] Server started on port ${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  const server = await startServer();
  console.log("[prerender] Launching browser...");

  const isVercel = !!process.env.VERCEL;

  let launchOpts;
  if (isVercel) {
    const Chromium = (await import("@sparticuz/chromium")).default;
    launchOpts = {
      args: Chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await Chromium.executablePath(),
      headless: true,
    };
  } else {
    const puppeteer = require("puppeteer-core");
    launchOpts = {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    };
    if (process.platform === "win32") {
      launchOpts.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }
  }

  const puppeteer = require("puppeteer-core");
  const browser = await puppeteer.launch(launchOpts);

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      console.log(`[prerender] Rendering ${route.name}: ${route.path}`);

      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("app-welcome-dismissed", "1");
        localStorage.setItem("app-ui-theme", "light");
      });

      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle2", timeout: 60000 });

      const html = await page.content();

      const cleanHtml = html.replace(/<div id="modal">[\s\S]*?<\/div>/g, '<div id="modal"></div>');

      const outDir = route.path === "/" ? DIST : path.join(DIST, route.path);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      fs.writeFileSync(path.join(outDir, "index.html"), cleanHtml);
      console.log(`[prerender] Saved ${route.name} -> ${path.join(outDir, "index.html")}`);
    } catch (err) {
      console.error(`[prerender] Failed ${route.name}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log("[prerender] Done");
}

prerender();
