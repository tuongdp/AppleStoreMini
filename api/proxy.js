export default async function handler(req, res) {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
        const decodedUrl = decodeURIComponent(url);
        new URL(decodedUrl); // validate
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    const decodedUrl = decodeURIComponent(url);

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

        if (!fetchRes.ok) {
            return res.status(fetchRes.status).json({ error: `Upstream returned ${fetchRes.status}` });
        }

        const body = await fetchRes.text();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.status(200).send(body);
    } catch (err) {
        res.status(500).json({ error: "Proxy fetch failed: " + (err.message || "unknown") });
    }
}
