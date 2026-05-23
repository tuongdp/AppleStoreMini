import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Filter, Palette, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
    useGetGlobalOptionsQuery,
    useCreateGlobalOptionMutation,
    useUpdateGlobalOptionMutation,
    useDeleteGlobalOptionMutation,
} from "@/store/api/globalOptionsApi";

const OPTION_TYPES = [
    { value: "COLOR", label: "Màu sắc" },
    { value: "STORAGE", label: "Dung lượng" },
    { value: "RAM", label: "RAM" },
    { value: "EDITION", label: "Phiên bản" },
];

const HEX_PRESETS = [
    "#000000", "#1d1d1f", "#3a3a3c", "#636366", "#aeaeb2",
    "#f5f5f7", "#ffffff", "#ff3b30", "#ff9500", "#ffcc00",
    "#34c759", "#007aff", "#5856d6", "#af52de", "#ff2d55",
];

const getOptionTypeLabel = (type) =>
    OPTION_TYPES.find((item) => item.value === type)?.label || type;

const SummaryCard = ({ icon: Icon, label, value, className }) => (
    <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${className}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold text-foreground">{value || 0}</p>
            </div>
        </div>
    </div>
);

export default function AdminGlobalOptionsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialType = OPTION_TYPES.some((type) => type.value === searchParams.get("type"))
        ? searchParams.get("type")
        : "COLOR";
    const [activeTab, setActiveTab] = useState(initialType);
    const [newValue, setNewValue] = useState("");
    const [newHex, setNewHex] = useState("#000000");
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    const { data: options = [], isLoading } = useGetGlobalOptionsQuery(activeTab);
    const { data: allOptions = [] } = useGetGlobalOptionsQuery();
    const [createOption, { isLoading: isCreating }] = useCreateGlobalOptionMutation();
    const [updateOption, { isLoading: isUpdating }] = useUpdateGlobalOptionMutation();
    const [deleteOption, { isLoading: isDeleting }] = useDeleteGlobalOptionMutation();

    const filtered = options.filter((o) =>
        o.value.toLowerCase().includes(search.toLowerCase()),
    );

    const activeType = OPTION_TYPES.find((item) => item.value === activeTab);
    const activeOptions = allOptions.filter((o) => o.type === activeTab);
    const activeTotal = activeOptions.length;
    const configuredColors = activeOptions.filter((o) => o.hex).length;
    const activeSummaryLabel = activeTab === "COLOR" ? "Màu sắc" : activeType?.label || "Tùy chọn";
    const configuredLabel = activeTab === "COLOR" ? "Màu đã có mã" : "Tổng toàn cục";
    const configuredValue = activeTab === "COLOR" ? configuredColors : allOptions.length;

    const updateViewParams = ({ type = activeTab, keyword = search }) => {
        const params = new URLSearchParams(searchParams);
        if (type === "COLOR") params.delete("type");
        else params.set("type", type);
        if (keyword.trim()) params.set("search", keyword.trim());
        else params.delete("search");
        setSearchParams(params, { replace: true });
    };

    const handleAdd = async () => {
        if (!newValue.trim()) return;
        try {
            await createOption({
                type: activeTab,
                value: newValue.trim(),
                hex: activeTab === "COLOR" ? newHex : null,
            }).unwrap();
            setNewValue("");
            toast.success("Đã thêm tùy chọn");
        } catch (err) {
            toast.error(err?.data?.message || "Không thể thêm tùy chọn");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteOption(deleteId).unwrap();
            toast.success("Xóa thành công");
            setDeleteId(null);
        } catch (err) {
            toast.error(err?.data?.message || "Không thể xóa");
        }
    };

    const handleHexChange = async (option, hex) => {
        try {
            await updateOption({ id: option.id, hex }).unwrap();
            toast.success("Đã cập nhật màu");
        } catch {
            toast.error("Không thể cập nhật màu");
        }
    };

    const startEdit = (option) => {
        setEditingId(option.id);
        setEditingValue(option.value);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const saveEdit = async (option) => {
        if (!editingValue.trim()) {
            toast.error("Giá trị không được để trống");
            return;
        }
        try {
            await updateOption({
                id: option.id,
                value: editingValue.trim(),
            }).unwrap();
            toast.success("Đã cập nhật tùy chọn");
            cancelEdit();
        } catch (err) {
            toast.error(err?.data?.message || "Không thể cập nhật");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Tùy chọn toàn cục
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Quản lý các giá trị dùng chung cho biến thể sản phẩm: màu sắc, dung lượng, RAM và phiên bản.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                    icon={SlidersHorizontal}
                    label={`Tổng ${activeSummaryLabel.toLowerCase()}`}
                    value={activeTotal}
                    className="bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                />
                <SummaryCard
                    icon={activeTab === "COLOR" ? Palette : Filter}
                    label="Đang hiển thị"
                    value={filtered.length}
                    className="bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                />
                <SummaryCard
                    icon={Check}
                    label={configuredLabel}
                    value={configuredValue}
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                />
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    setActiveTab(value);
                    setSearch("");
                    cancelEdit();
                    updateViewParams({ type: value, keyword: "" });
                }}
            >
                <TabsList className="h-auto flex-wrap justify-start">
                    {OPTION_TYPES.map((type) => (
                        <TabsTrigger key={type.value} value={type.value} className="text-xs">
                            {type.label}
                            <Badge variant="secondary" className="ml-2 rounded-full px-1.5 text-[10px]">
                                {allOptions.filter((o) => o.type === type.value).length}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Thêm {activeType?.label?.toLowerCase()}
                        </p>
                    </div>
                    <Badge variant="outline">{getOptionTypeLabel(activeTab)}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        aria-label={`Thêm ${activeType?.label?.toLowerCase() || "tùy chọn"}`}
                        placeholder="Thêm giá trị..."
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="h-9 max-w-[220px] text-xs"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAdd();
                            }
                        }}
                    />
                    {activeTab === "COLOR" && (
                        <div className="flex items-center gap-1">
                            <input
                                aria-label="Chọn mã màu"
                                type="color"
                                value={newHex}
                                onChange={(e) => setNewHex(e.target.value)}
                                className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                            />
                            <div className="flex flex-wrap gap-0.5">
                                {HEX_PRESETS.map((hex) => (
                                    <button
                                        key={hex}
                                        type="button"
                                        onClick={() => setNewHex(hex)}
                                        className="h-5 w-5 rounded-full border border-border"
                                        style={{ backgroundColor: hex }}
                                        aria-label={hex}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <Button
                        size="sm"
                        className="rounded-full"
                        onClick={handleAdd}
                        disabled={!newValue.trim() || isCreating}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Thêm
                    </Button>

                    <div className="relative ml-auto">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            aria-label="Tìm kiếm tùy chọn"
                            placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            updateViewParams({ keyword: e.target.value });
                        }}
                            className="h-8 w-[180px] pl-8 text-xs"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    updateViewParams({ keyword: "" });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                aria-label="Xóa từ khóa tìm kiếm"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                {isLoading ? (
                    <div className="space-y-2 p-4">
                        {[...Array(5)].map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        Chưa có giá trị nào. Thêm giá trị đầu tiên ở trên.
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-muted/50">
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">{activeTab === "COLOR" ? "Xem trước" : "Loại"}</th>
                                    <th className="px-4 py-3 font-medium">Giá trị</th>
                                    <th className="px-4 py-3 text-right font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((option) => {
                                    const isEditing = editingId === option.id;
                                    return (
                                        <tr key={option.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-2">
                                                {activeTab === "COLOR" ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            aria-label={`Chọn mã màu cho ${option.value}`}
                                                            type="color"
                                                            value={option.hex || "#cccccc"}
                                                            onChange={(e) => handleHexChange(option, e.target.value)}
                                                            className="h-7 w-7 cursor-pointer rounded border-0 p-0"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {option.hex || "Chưa có mã"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary">{getOptionTypeLabel(option.type)}</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-foreground">
                                                {isEditing ? (
                                                    <Input
                                                        value={editingValue}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        className="h-8 max-w-xs text-xs"
                                                    />
                                                ) : (
                                                    option.value
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 rounded-full px-2 text-xs"
                                                                disabled={isUpdating}
                                                                onClick={() => saveEdit(option)}
                                                            >
                                                                Lưu
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 rounded-full px-2 text-xs"
                                                                onClick={cancelEdit}
                                                            >
                                                                Hủy
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 rounded-full px-2 text-xs"
                                                            onClick={() => startEdit(option)}
                                                        >
                                                            Sửa
                                                        </Button>
                                                    )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                                                            disabled={isDeleting}
                                                            onClick={() => setDeleteId(option.id)}
                                                            aria-label={`Xóa tùy chọn ${option.value}`}
                                                        >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Xóa tùy chọn"
                description="Bạn có chắc muốn xóa tùy chọn này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
