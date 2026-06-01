const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
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

  let browser;
  try {
    browser = await puppeteer.launch(
      isVercel
        ? {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
          }
        : {
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
            executablePath: process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : "/usr/bin/google-chrome",
          }
    );

    for (const route of ROUTES) {
      const page = await browser.newPage();
      try {
        console.log(`[prerender] Rendering ${route.name}: ${route.path}`);
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle2", timeout: 60000 });

        const html = await page.content();

        const outDir = route.path === "/" ? DIST : path.join(DIST, route.path);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        fs.writeFileSync(path.join(outDir, "index.html"), html);
        console.log(`[prerender] Saved ${route.name} -> ${path.join(outDir, "index.html")}`);
      } catch (err) {
        console.error(`[prerender] Failed ${route.name}:`, err.message);
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.close();
    console.log("[prerender] Done");
  }
}

prerender();
