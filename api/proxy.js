export const config = {
    runtime: "nodejs",
};

export default async function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(200).end();
    }

    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "Missing url parameter" });
    }

    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(url);
        new URL(decodedUrl);
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    try {
        const fetchRes = await fetch(decodedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "vi-VN,vi;q=0.9",
                "Referer": "https://www.google.com/",
            },
            redirect: "follow",
        });

        const body = await fetchRes.text();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300");
        return res.status(200).send(body);
    } catch (err) {
        return res.status(502).json({
            error: "proxy_fetch_failed",
            message: err.message || "Unknown error",
            code: err.cause?.code || err.code || "unknown",
        });
    }
}
