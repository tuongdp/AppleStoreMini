import { createPdfDoc } from "./pdfFont";

const BLUE = "#1e40af";
const STRIPE = "#f3f4f6";
const LOCALE = "vi-VN";

async function loadExcelExporter() {
    return import("xlsx");
}

async function loadPDFExporter() {
    const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
    ]);
    return {
        jsPDF,
        autoTable: autoTableModule.default,
    };
}

// ── Helpers ──────────────────────────────────────────────

function formatCellValue(value, format) {
    if (value === null || value === undefined) return "\u2014";
    if (format === "currency") {
        if (value === "") return "\u2014";
        return Number(value) || 0;
    }
    if (format === "date") {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    return value;
}

function formatPdfValue(value, format) {
    if (value === null || value === undefined) return "\u2014";
    if (format === "currency") {
        if (value === "" || value === 0) return "0 đ";
        return (Number(value) || 0).toLocaleString("vi-VN") + " đ";
    }
    if (format === "date") {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    return value;
}

function dateString() {
    return new Intl.DateTimeFormat(LOCALE, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date());
}

function colIndex(n) {
    let s = "";
    while (n >= 0) {
        s = String.fromCharCode(65 + (n % 26)) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
}

function autoWidth(rows, cols, max = 40) {
    return cols.map((col) => {
        let w = col.label ? col.label.length : 8;
        for (const row of rows) {
            const v = row[col.key];
            const display = col.format === "currency"
                ? String(Number(v) || 0).length + 4
                : formatCellValue(v, col.format);
            const len = typeof display === "string" ? display.length : String(display || "").length;
            if (len > w) w = len;
        }
        return { wch: Math.min(w + 4, max) };
    });
}

// ── exportToExcel ────────────────────────────────────────

export async function exportToExcel({ sheets, filename = "export.xlsx" }) {
    const XLSX = await loadExcelExporter();
    const wb = XLSX.utils.book_new();

    for (const sheet of sheets) {
        const { name, columns, rows } = sheet;

        const header = columns.map((c) => c.label);
        const data = [header];

        for (const row of rows) {
            data.push(columns.map((c) => formatCellValue(row[c.key], c.format)));
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        const range = XLSX.utils.decode_range(ws["!ref"]);

        ws["!autofilter"] = { ref: ws["!ref"] };

        // Header styling
        for (let C = range.s.c; C <= range.e.c; C++) {
            const addr = colIndex(C) + "1";
            if (!ws[addr]) ws[addr] = { t: "s", v: header[C] };
            ws[addr].s = {
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                fill: { fgColor: { rgb: BLUE.replace("#", "") } },
                alignment: { horizontal: "center", vertical: "center" },
            };
        }

        // Data rows: striping and column alignment/number format
        for (let R = range.s.r + 1; R <= range.e.r; R++) {
            const rowIndex = R - 1; // 0-based data row index
            const bg = rowIndex % 2 === 1 ? STRIPE.replace("#", "") : undefined;
            for (let C = range.s.c; C <= range.e.c; C++) {
                const addr = colIndex(C) + (R + 1);
                if (!ws[addr]) ws[addr] = { t: "s", v: "" };
                const col = columns[C];
                if (!ws[addr].s) ws[addr].s = {};

                if (bg) {
                    ws[addr].s.fill = { fgColor: { rgb: bg } };
                }

                if (col?.format === "currency") {
                    ws[addr].s.numFmt = '#,##0 "đ"';
                    ws[addr].s.alignment = { horizontal: "right" };
                } else if (col?.format === "date") {
                    ws[addr].s.numFmt = "dd/mm/yyyy";
                    ws[addr].s.alignment = { horizontal: "center" };
                }
            }
        }

        ws["!cols"] = autoWidth(rows, columns);

        XLSX.utils.book_append_sheet(wb, ws, name || "Sheet1");
    }

    try {
        XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
    } catch (e) {
        console.error("Excel export failed:", e);
        throw e;
    }
}

// ── exportToPDF ──────────────────────────────────────────

export async function exportToPDF({
    title,
    subtitle,
    columns,
    rows,
    filename = "export.pdf",
    orientation = "portrait",
}) {
    const { autoTable } = await loadPDFExporter();
    const doc = await createPdfDoc({ orientation });
    const pageW = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("AppleStore Mini", 14, 10);
    doc.text(dateString(), pageW - 14, 10, { align: "right" });

    // Title
    doc.setFontSize(14);
    doc.setTextColor(BLUE);
    doc.text(title, pageW / 2, 22, { align: "center", maxWidth: pageW - 28 });

    // Subtitle
    let startY = 28;
    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(subtitle, pageW / 2, startY, { align: "center", maxWidth: pageW - 28 });
        startY = 34;
    }

    // Build table body with formatted values
    const bodyRows = rows.map((row) =>
        columns.map((c) => formatPdfValue(row[c.key], c.format))
    );

    // Determine column alignment config for autotable
    const columnStyles = {};
    columns.forEach((c, i) => {
        if (c.format === "currency") {
            columnStyles[i] = { halign: "right" };
        } else if (c.format === "date") {
            columnStyles[i] = { halign: "center" };
        }
    });

    autoTable(doc, {
        head: [columns.map((c) => c.label)],
        body: bodyRows,
        startY,
        theme: "grid",
        headStyles: {
            fillColor: BLUE,
            textColor: "#FFFFFF",
            fontStyle: "bold",
            fontSize: 9,
            halign: "center",
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 2,
        },
        alternateRowStyles: {
            fillColor: STRIPE,
        },
        columnStyles,
        didDrawPage: () => {
            // Footer with page number
            const total = doc.internal.getNumberOfPages();
            for (let i = 1; i <= total; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Trang ${i} / ${total}`,
                    pageW / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: "center" }
                );
            }
        },
    });

    try {
        doc.save(filename);
    } catch (e) {
        console.error("PDF export failed:", e);
        throw e;
    }
}

// ── exportDashboardPDF ───────────────────────────────────

export async function exportDashboardPDF({ sections, filename = "dashboard.pdf" }) {
    const { autoTable } = await loadPDFExporter();
    const doc = await createPdfDoc({ orientation: "portrait" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const marginBottom = 15;

    let y = 18;

    // Header bar
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("AppleStore Mini", marginX, 10);
    doc.text(dateString(), pageW - marginX, 10, { align: "right" });

    function checkPageBreak(needed) {
        if (y + needed > pageH - marginBottom) {
            doc.addPage();
            y = 18;
        }
    }

    for (const section of sections) {
        if (section.type === "title") {
            checkPageBreak(12);
            doc.setFontSize(12);
            doc.setTextColor(BLUE);
            doc.text(section.text, pageW / 2, y, { align: "center", maxWidth: pageW - 28 });
            y += 10;
            continue;
        }

        if (section.type === "table") {
            const headRow = section.columns.map((c) => c.label);
            const bodyRows = section.rows.map((row) =>
                section.columns.map((c) => formatPdfValue(row[c.key], c.format))
            );

            const columnStyles = {};
            section.columns.forEach((c, i) => {
                if (c.format === "currency") {
                    columnStyles[i] = { halign: "right" };
                } else if (c.format === "date") {
                    columnStyles[i] = { halign: "center" };
                }
            });

            // Section table title
            if (section.title) {
                checkPageBreak(8);
                doc.setFontSize(9);
                doc.setTextColor(60);
                doc.text(section.title, marginX, y);
                y += 6;
            }

            checkPageBreak(10); // at least header

            autoTable(doc, {
                head: [headRow],
                body: bodyRows,
                startY: y,
                margin: { left: marginX, right: marginX },
                theme: "grid",
                headStyles: {
                    fillColor: BLUE,
                    textColor: "#FFFFFF",
                    fontStyle: "bold",
                    fontSize: 8,
                    halign: "center",
                },
                bodyStyles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                },
                alternateRowStyles: {
                    fillColor: STRIPE,
                },
                columnStyles,
            });

            y = doc.lastAutoTable.finalY + 6;
        }
    }

    // Draw footers on all pages once
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Trang ${i} / ${total}`,
            pageW / 2,
            pageH - 10,
            { align: "center" }
        );
    }

    try {
        doc.save(filename);
    } catch (e) {
        console.error("Dashboard PDF export failed:", e);
        throw e;
    }
}
