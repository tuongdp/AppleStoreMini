import { useState } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    useGetGlobalOptionsQuery,
    useCreateGlobalOptionMutation,
    useUpdateGlobalOptionMutation,
    useDeleteGlobalOptionMutation,
} from "@/store/api/globalOptionsApi";

const OPTION_TYPES = [
    { value: "COLOR", labelKey: "productForm.colorLabel" },
    { value: "STORAGE", labelKey: "productForm.storageLabel" },
    { value: "RAM", labelKey: "productForm.ramLabel" },
    { value: "EDITION", labelKey: "productForm.editionLabel" },
];

const HEX_PRESETS = [
    "#000000", "#1d1d1f", "#3a3a3c", "#636366", "#aeaeb2",
    "#f5f5f7", "#ffffff", "#ff3b30", "#ff9500", "#ffcc00",
    "#34c759", "#007aff", "#5856d6", "#af52de", "#ff2d55",
];

export default function AdminGlobalOptionsPage() {
    const [activeTab, setActiveTab] = useState("COLOR");
    const [newValue, setNewValue] = useState("");
    const [newHex, setNewHex] = useState("#000000");
    const [search, setSearch] = useState("");

    const { data: options = [], isLoading } = useGetGlobalOptionsQuery(activeTab);
    const [createOption] = useCreateGlobalOptionMutation();
    const [updateOption] = useUpdateGlobalOptionMutation();
    const [deleteOption] = useDeleteGlobalOptionMutation();

    const filtered = options.filter((o) =>
        o.value.toLowerCase().includes(search.toLowerCase()),
    );

    const handleAdd = async () => {
        if (!newValue.trim()) return;
        try {
            await createOption({
                type: activeTab,
                value: newValue.trim(),
                hex: activeTab === "COLOR" ? newHex : null,
            }).unwrap();
            setNewValue("");
            toast.success(t("productForm.toast.addOptionSuccess", { type: t(OPTION_TYPES.find((t2) => t2.value === activeTab)?.labelKey) }));
        } catch (err) {
            toast.error(err?.data?.message || "Error");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteOption(id).unwrap();
            toast.success("Xoá thành công");
        } catch (err) {
            toast.error(err?.data?.message || "Error");
        }
    };

    const handleHexChange = async (option, hex) => {
        try {
            await updateOption({ id: option.id, hex }).unwrap();
        } catch {
            // silent
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-foreground">
                {"Tùy chọn toàn cục"}
            </h1>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch(""); }}>
                <TabsList className="h-10">
                    {OPTION_TYPES.map((ot) => (
                        <TabsTrigger key={ot.value} value={ot.value} className="text-xs">
                            {t(ot.labelKey)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder={"Thêm giá trị..."}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="h-9 max-w-[200px] text-xs"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                />
                {activeTab === "COLOR" && (
                    <div className="flex items-center gap-1">
                        <input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)} className="h-8 w-8 cursor-pointer rounded border-0 p-0" />
                        <div className="flex gap-0.5">
                            {HEX_PRESETS.map((hex) => (
                                <button key={hex} type="button" onClick={() => setNewHex(hex)} className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: hex }} />
                            ))}
                        </div>
                    </div>
                )}
                <Button size="icon" className="h-8 w-8 rounded-full" onClick={handleAdd} disabled={!newValue.trim()}>
                    <Plus className="h-4 w-4" />
                </Button>

                <div className="relative ml-auto">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={"Tìm kiếm..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 w-[180px] pl-8 text-xs"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                            <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-border">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        {"Chưa có giá trị nào. Thêm giá trị đầu tiên ở trên."}
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-muted/50">
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">{activeTab === "COLOR" ? "Xem trước" : ""}</th>
                                    <th className="px-4 py-3 font-medium">{"Giá trị"}</th>
                                    <th className="px-4 py-3 text-right font-medium">{"Hành động"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((opt) => (
                                    <tr key={opt.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                                        <td className="px-4 py-2">
                                            {activeTab === "COLOR" && (
                                                <input type="color" value={opt.hex || "#ccc"} onChange={(e) => handleHexChange(opt, e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 p-0" />
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-foreground">{opt.value}</td>
                                        <td className="px-4 py-2 text-right">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive" onClick={() => handleDelete(opt.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
