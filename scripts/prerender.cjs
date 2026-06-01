const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "../dist");
const BASE_URL = "http://localhost:3000";

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

async function prerender() {
  console.log("[prerender] Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      console.log(`[prerender] Rendering ${route.name}: ${route.path}`);
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle2", timeout: 30000 });

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

  await browser.close();
  console.log("[prerender] Done");
}

prerender();
