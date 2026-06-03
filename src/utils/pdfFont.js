let fontReady = false;
let fontPromise = null;

const FONT_URL = "https://cdn.jsdelivr.net/gh/adobe-fonts/source-sans@3.046/TTF/SourceSans3-Regular.ttf";
const FONT_NAME = "SourceSansVN";

async function loadPdfFont() {
    if (fontReady) return;
    if (fontPromise) { await fontPromise; return; }

    fontPromise = (async () => {
        const { jsPDF } = await import("jspdf");
        try {
            const res = await fetch(FONT_URL);
            if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let base64 = "";
            for (let i = 0; i < bytes.length; i++) {
                base64 += String.fromCharCode(bytes[i]);
            }
            base64 = btoa(base64);
            jsPDF.API.addFont(base64, FONT_NAME, "normal");
            fontReady = true;
        } catch (e) {
            console.warn("[PDF] Không thể tải font tiếng Việt, dùng font mặc định:", e.message);
            fontReady = true;
        }
    })();

    await fontPromise;
}

export async function createPdfDoc(options = {}) {
    await loadPdfFont();
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: options.orientation || "portrait", unit: "mm", format: "a4" });
    if (fontReady) {
        doc.setFont(FONT_NAME);
    }
    if (options.register) {
        options.register(doc);
    }
    return doc;
}
