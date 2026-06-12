let fontReady = false;
let fontPromise = null;

const FONT_URL = "/times.ttf";
const FONT_NAME = "TimesVN";
const FONT_FILE = "times.ttf";

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
            jsPDF.API.addFileToVFS(FONT_FILE, base64);
            jsPDF.API.addFont(FONT_FILE, FONT_NAME, "normal");
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

export function getPdfFontFamily() {
    return fontReady ? FONT_NAME : "helvetica";
}
