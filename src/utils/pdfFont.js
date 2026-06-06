let fontReady = false;
let fontPromise = null;

const FONT_URL = "/times.ttf";
const FONT_NAME = "TimesVN";

function arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function loadPdfFont() {
    if (fontReady) { return; }
    if (fontPromise) { await fontPromise; return; }

    fontPromise = (async () => {
        const { jsPDF } = await import("jspdf");
        try {
            const res = await fetch(FONT_URL);
            if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
            const buf = await res.arrayBuffer();
            const base64 = arrayBufferToBase64(buf);
            jsPDF.API.addFont(base64, FONT_NAME, "normal");
            fontReady = true;
        } catch (e) {
            console.warn("[PDF] Không thể tải font tiếng Việt:", e.message);
            fontReady = false;
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
    return doc;
}
