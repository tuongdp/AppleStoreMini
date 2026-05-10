import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Eye, Check, AlertTriangle, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ImportSpecsFromExcel({ onImport, onCancel }) {
    const [preview, setPreview] = useState([]);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [editableSpecs, setEditableSpecs] = useState([]);
    const fileRef = useRef(null);

    const parseFile = (file) => {
        setError("");
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (json.length < 2) {
                    setError("File Excel không có dữ liệu");
                    return;
                }

                const headers = json[0];
                const labelIdx = headers.findIndex(
                    (h) => h && String(h).toLowerCase().trim() === "label",
                );
                const valueIdx = headers.findIndex(
                    (h) => h && String(h).toLowerCase().trim() === "value",
                );

                if (labelIdx === -1 || valueIdx === -1) {
                    setError("File không có cột \"label\" và \"value\"");
                    return;
                }

                const rows = json.slice(1).filter((row) => {
                    const label = row[labelIdx];
                    const value = row[valueIdx];
                    return label !== undefined && label !== null && String(label).trim() !== "";
                });

                if (rows.length === 0) {
                    setError("Không tìm thấy dòng dữ liệu nào");
                    return;
                }

                const specs = rows.map((row) => ({
                    key: String(row[labelIdx] ?? "").trim(),
                    value: row[valueIdx] !== undefined && row[valueIdx] !== null
                        ? String(row[valueIdx]).trim()
                        : "",
                }));

                setPreview(specs);
                setEditableSpecs(specs.map((s) => ({ ...s })));
                setShowPreview(true);
            } catch {
                setError("Lỗi khi đọc file. Kiểm tra định dạng file.");
            }
        };
        reader.onerror = () => setError("Lỗi khi đọc file. Kiểm tra định dạng file.");
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) parseFile(file);
    };

    const updateEditable = (idx, field, val) => {
        const next = [...editableSpecs];
        next[idx] = { ...next[idx], [field]: val };
        setEditableSpecs(next);
    };

    const removeEditable = (idx) => {
        setEditableSpecs(editableSpecs.filter((_, i) => i !== idx));
    };

    const addEditable = () => {
        setEditableSpecs([...editableSpecs, { key: "", value: "" }]);
    };

    const handleConfirm = () => {
        const valid = editableSpecs.filter((s) => s.key.trim() !== "");
        onImport?.(valid);
    };

    if (showPreview) {
        return (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground">
                            {"Xem trước thông số"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {t("productForm.importSpecsPreviewDesc", { file: fileName })}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onCancel}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mb-3 max-h-64 overflow-auto rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/2">{"Tên thông số"}</TableHead>
                                <TableHead className="w-1/2">{"Giá trị"}</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {editableSpecs.map((spec, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="p-1">
                                        <input
                                            value={spec.key}
                                            onChange={(e) => updateEditable(idx, "key", e.target.value)}
                                            placeholder={"Tên thông số"}
                                            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <input
                                            value={spec.value}
                                            onChange={(e) => updateEditable(idx, "value", e.target.value)}
                                            placeholder={"Giá trị"}
                                            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeEditable(idx)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addEditable}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        {"Thêm thông số"}
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onCancel}>
                            {"Huỷ"}
                        </Button>
                        <Button type="button" size="sm" className="rounded-full" onClick={handleConfirm}>
                            <Check className="mr-1 h-3.5 w-3.5" />
                            {"Xác nhận"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-dashed border-border p-5 md:p-6">
            <div className="flex flex-col items-center gap-3">
                {error ? (
                    <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <p className="text-sm text-destructive">{error}</p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => {
                                    setError("");
                                    fileRef.current?.click();
                                }}
                            >
                                <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                                {"Chọn lại file"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full"
                                onClick={onCancel}
                            >
                                {"Huỷ"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <button
                        type="button"
                        className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl py-6 transition-colors hover:bg-muted/50"
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {"Tải lên file Excel"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {"Kéo thả hoặc click để chọn file .xlsx, .xls, .csv"}
                            </p>
                        </div>
                        <Button type="button" variant="secondary" size="sm" className="mt-1 rounded-full">
                            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                            {fileName || "Chọn file"}
                        </Button>
                    </button>
                )}

                <p className="text-center text-xs text-muted-foreground">
                    {"File cần có 2 cột: \"label\" và \"value\". Nếu value trống → section header."}
                </p>

                <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
