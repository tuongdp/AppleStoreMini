import { createPdfDoc, getPdfFontFamily } from "./pdfFont";

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
        return `${(Number(value) || 0).toLocaleString("vi-VN")} đ`;
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

function dateTimeString() {
    return new Intl.DateTimeFormat(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date());
}

function upperTitle(title) {
    return String(title || "Báo cáo").toLocaleUpperCase(LOCALE);
}

function drawReportHeader(doc, { title, subtitle, pageW, marginX, fontFamily }) {
    let y = 10;

    doc.setFont(fontFamily, "normal");
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(10);
    doc.text("APPLESTORE MINI", marginX, y);
    doc.setTextColor(80);
    doc.setFontSize(8);
    y += 4;
    doc.text("Báo cáo quản trị nội bộ", marginX, y);
    doc.text(`Ngày lập: ${dateTimeString()}`, pageW - marginX, y, { align: "right" });

    y += 10;
    doc.setDrawColor(30, 64, 175);
    doc.line(marginX, y, pageW - marginX, y);

    y += 10;
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(16);
    doc.text(upperTitle(title), pageW / 2, y, { align: "center", maxWidth: pageW - marginX * 2 });

    y += 7;
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text(subtitle || "Nguồn dữ liệu: hệ thống AppleStore Mini", pageW / 2, y, {
        align: "center",
        maxWidth: pageW - marginX * 2,
    });

    y += 8;
    doc.setTextColor(80);
    doc.setFontSize(9);
    doc.text("Nội dung chi tiết", marginX, y);

    return y + 5;
}

function drawReportSignatures(doc, { y, pageW, pageH, marginX, fontFamily }) {
    const requiredHeight = 42;
    if (y + requiredHeight > pageH - 16) {
        doc.addPage();
        y = 24;
    }

    y += 8;
    doc.setFont(fontFamily, "normal");
    doc.setDrawColor(220);
    doc.line(marginX, y, pageW - marginX, y);

    y += 10;
    const colW = (pageW - marginX * 2) / 3;
    const columns = [
        { title: "Người lập báo cáo", x: marginX + colW / 2 },
        { title: "Kế toán / Quản lý", x: marginX + colW * 1.5 },
        { title: "Ban giám đốc", x: marginX + colW * 2.5 },
    ];

    doc.setTextColor(80);
    doc.setFontSize(9);
    columns.forEach((col) => {
        doc.text(col.title, col.x, y, { align: "center" });
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text("(Ký, ghi rõ họ tên)", col.x, y + 5, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(80);
    });

    return y + 28;
}

function drawPageFooters(doc, { pageW, pageH, fontFamily }) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont(fontFamily, "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Trang ${i} / ${total}`, pageW / 2, pageH - 10, { align: "center" });
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function splitRows(rows, rowsPerPage) {
    const chunks = [];
    for (let i = 0; i < rows.length; i += rowsPerPage) {
        chunks.push(rows.slice(i, i + rowsPerPage));
    }
    return chunks.length > 0 ? chunks : [[]];
}

async function reportHtmlToImage(html, width = 794, height = 1123) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">${html}</div>
            </foreignObject>
        </svg>
    `;
    const img = new Image();
    img.decoding = "async";
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
}

function buildReportPageHtml({ title, subtitle, columns, rows, pageNumber, totalPages, includeSignatures }) {
    const tableRows = rows.map((row, rowIndex) => `
        <tr class="${rowIndex % 2 === 1 ? "alt" : ""}">
            ${columns.map((col) => `
                <td class="${col.format === "currency" ? "num" : ""}">
                    ${escapeHtml(formatPdfValue(row[col.key], col.format))}
                </td>
            `).join("")}
        </tr>
    `).join("");

    const signatures = includeSignatures ? `
        <div class="signatures">
            <div><strong>Người lập báo cáo</strong><span>(Ký, ghi rõ họ tên)</span></div>
            <div><strong>Kế toán / Quản lý</strong><span>(Ký, ghi rõ họ tên)</span></div>
            <div><strong>Ban giám đốc</strong><span>(Ký, ghi rõ họ tên)</span></div>
        </div>
    ` : "";

    return `
        <style>
            * { box-sizing: border-box; }
            .page {
                width: 794px;
                height: 1123px;
                padding: 44px 52px 38px;
                background: #fff;
                color: #1f2937;
                font-family: Arial, "Times New Roman", sans-serif;
                position: relative;
            }
            .top {
                display: flex;
                justify-content: space-between;
                gap: 24px;
                color: #4b5563;
                font-size: 13px;
                line-height: 1.35;
            }
            .brand {
                color: #1e40af;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: .2px;
            }
            .date { text-align: right; white-space: nowrap; }
            .rule { height: 2px; background: #1e40af; margin: 18px 0 24px; }
            h1 {
                margin: 0;
                color: #1e40af;
                text-align: center;
                font-size: 25px;
                line-height: 1.25;
                font-weight: 700;
                text-transform: uppercase;
            }
            .subtitle {
                margin: 10px auto 22px;
                max-width: 680px;
                color: #4b5563;
                text-align: center;
                font-size: 14px;
                line-height: 1.45;
            }
            .section-title {
                margin: 0 0 8px;
                font-size: 14px;
                font-weight: 700;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                font-size: 12px;
            }
            th {
                background: #1e40af;
                color: white;
                padding: 8px 7px;
                border: 1px solid #1e40af;
                text-align: center;
                font-weight: 700;
            }
            td {
                padding: 7px;
                border: 1px solid #d1d5db;
                vertical-align: top;
                word-break: break-word;
            }
            tr.alt td { background: #f3f4f6; }
            td.num { text-align: right; white-space: nowrap; }
            .signatures {
                position: absolute;
                left: 52px;
                right: 52px;
                bottom: 70px;
                border-top: 1px solid #d1d5db;
                padding-top: 18px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 18px;
                text-align: center;
                font-size: 13px;
            }
            .signatures span {
                display: block;
                margin-top: 6px;
                color: #6b7280;
                font-size: 12px;
            }
            .footer {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 28px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
            }
        </style>
        <div class="page">
            <div class="top">
                <div>
                    <div class="brand">APPLESTORE MINI</div>
                    <div>Báo cáo quản trị nội bộ</div>
                </div>
                <div class="date">Ngày lập: ${escapeHtml(dateTimeString())}</div>
            </div>
            <div class="rule"></div>
            <h1>${escapeHtml(upperTitle(title))}</h1>
            <div class="subtitle">${escapeHtml(subtitle || "Nguồn dữ liệu: hệ thống AppleStore Mini")}</div>
            <div class="section-title">Nội dung chi tiết</div>
            <table>
                <thead>
                    <tr>${columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}</tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            ${signatures}
            <div class="footer">Trang ${pageNumber} / ${totalPages}</div>
        </div>
    `;
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
                ? formatCellValue(v, col.format)
                : formatCellValue(v, col.format);
            const len = typeof display === "string" ? display.length : String(display || "").length;
            if (len > w) w = len;
        }
        return { wch: Math.min(w + 4, max) };
    });
}

// ── exportToExcel ────────────────────────────────────────

export async function exportToExcel({ sheets, filename = "export.xlsx", title, subtitle }) {
    const XLSX = await loadExcelExporter();
    const wb = XLSX.utils.book_new();

    for (const sheet of sheets) {
        const { name, columns, rows } = sheet;
        const reportTitle = sheet.title || title;
        const reportSubtitle = sheet.subtitle || subtitle || "Nguồn dữ liệu: hệ thống AppleStore Mini";

        const header = columns.map((c) => c.label);
        const data = [];
        if (reportTitle) {
            data.push(
                ["APPLESTORE MINI"],
                [upperTitle(reportTitle)],
                [reportSubtitle],
                [`Ngày lập: ${dateTimeString()}`],
                [],
            );
        }

        const headerRowIndex = data.length;
        data.push(header);

        for (const row of rows) {
            data.push(columns.map((c) => formatCellValue(row[c.key], c.format)));
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        const range = XLSX.utils.decode_range(ws["!ref"]);
        const headerRowNumber = headerRowIndex + 1;
        const tableRef = `A${headerRowNumber}:${colIndex(header.length - 1)}${range.e.r + 1}`;

        ws["!autofilter"] = { ref: tableRef };
        if (reportTitle && columns.length > 1) {
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: columns.length - 1 } },
                { s: { r: 3, c: 0 }, e: { r: 3, c: columns.length - 1 } },
            ];
        }

        // Header styling
        for (let C = range.s.c; C <= range.e.c; C++) {
            const addr = colIndex(C) + headerRowNumber;
            if (!ws[addr]) ws[addr] = { t: "s", v: header[C] };
            ws[addr].s = {
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                fill: { fgColor: { rgb: BLUE.replace("#", "") } },
                alignment: { horizontal: "center", vertical: "center" },
            };
        }

        // Data rows: striping and column alignment/number format
        for (let R = headerRowIndex + 1; R <= range.e.r; R++) {
            const rowIndex = R - headerRowIndex - 1; // 0-based data row index
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
    const { jsPDF } = await loadPDFExporter();
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const rowsPerPage = orientation === "landscape" ? 18 : 24;
    const pages = splitRows(rows, rowsPerPage);

    for (let i = 0; i < pages.length; i++) {
        if (i > 0) doc.addPage();
        const imgData = await reportHtmlToImage(buildReportPageHtml({
            title,
            subtitle,
            columns,
            rows: pages[i],
            pageNumber: i + 1,
            totalPages: pages.length,
            includeSignatures: i === pages.length - 1,
        }));
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
    }

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
    const fontFamily = getPdfFontFamily();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const marginBottom = 15;

    const mainTitle = sections.find((section) => section.type === "title")?.text || "Báo cáo tổng hợp";
    let y = drawReportHeader(doc, { title: mainTitle, pageW, marginX, fontFamily });

    function checkPageBreak(needed) {
        if (y + needed > pageH - marginBottom) {
            doc.addPage();
            y = 18;
        }
    }

    for (const section of sections) {
        if (section.type === "title") {
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
                styles: {
                    font: fontFamily,
                    fontStyle: "normal",
                },
                headStyles: {
                    fillColor: BLUE,
                    textColor: "#FFFFFF",
                    fontStyle: "normal",
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

    drawReportSignatures(doc, { y, pageW, pageH, marginX, fontFamily });
    drawPageFooters(doc, { pageW, pageH, fontFamily });

    try {
        doc.save(filename);
    } catch (e) {
        console.error("Dashboard PDF export failed:", e);
        throw e;
    }
}
