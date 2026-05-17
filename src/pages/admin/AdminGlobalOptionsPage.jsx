import { useState } from "react";
import { Check, ListOrdered, Palette, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    useGetGlobalOptionsQuery,
    useCreateGlobalOptionMutation,
    useUpdateGlobalOptionMutation,
    useDeleteGlobalOptionMutation,
} from "@/store/api/globalOptionsApi";

const OPTION_TYPES = [
    { value: "COLOR", label: "Mau sac" },
    { value: "STORAGE", label: "Dung luong" },
    { value: "RAM", label: "RAM" },
    { value: "EDITION", label: "Phien ban" },
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
    const [activeTab, setActiveTab] = useState("COLOR");
    const [newValue, setNewValue] = useState("");
    const [newHex, setNewHex] = useState("#000000");
    const [newSortOrder, setNewSortOrder] = useState("");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [editingSortOrder, setEditingSortOrder] = useState("");

    const { data: options = [], isLoading } = useGetGlobalOptionsQuery(activeTab);
    const { data: allOptions = [] } = useGetGlobalOptionsQuery();
    const [createOption, { isLoading: isCreating }] = useCreateGlobalOptionMutation();
    const [updateOption, { isLoading: isUpdating }] = useUpdateGlobalOptionMutation();
    const [deleteOption, { isLoading: isDeleting }] = useDeleteGlobalOptionMutation();

    const filtered = options.filter((o) =>
        o.value.toLowerCase().includes(search.toLowerCase()),
    );

    const totalOptions = allOptions.length;
    const colorOptions = allOptions.filter((o) => o.type === "COLOR").length;
    const configuredColors = allOptions.filter((o) => o.type === "COLOR" && o.hex).length;
    const activeType = OPTION_TYPES.find((item) => item.value === activeTab);

    const handleAdd = async () => {
        if (!newValue.trim()) return;
        try {
            await createOption({
                type: activeTab,
                value: newValue.trim(),
                hex: activeTab === "COLOR" ? newHex : null,
                sortOrder: newSortOrder === "" ? 0 : Number(newSortOrder),
            }).unwrap();
            setNewValue("");
            setNewSortOrder("");
            toast.success("Da them tuy chon");
        } catch (err) {
            toast.error(err?.data?.message || "Khong the them tuy chon");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteOption(id).unwrap();
            toast.success("Xoa thanh cong");
        } catch (err) {
            toast.error(err?.data?.message || "Khong the xoa");
        }
    };

    const handleHexChange = async (option, hex) => {
        try {
            await updateOption({ id: option.id, hex }).unwrap();
            toast.success("Da cap nhat mau");
        } catch {
            toast.error("Khong the cap nhat mau");
        }
    };

    const startEdit = (option) => {
        setEditingId(option.id);
        setEditingValue(option.value);
        setEditingSortOrder(String(option.sortOrder ?? 0));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
        setEditingSortOrder("");
    };

    const saveEdit = async (option) => {
        if (!editingValue.trim()) {
            toast.error("Gia tri khong duoc de trong");
            return;
        }
        try {
            await updateOption({
                id: option.id,
                value: editingValue.trim(),
                sortOrder: editingSortOrder === "" ? 0 : Number(editingSortOrder),
            }).unwrap();
            toast.success("Da cap nhat tuy chon");
            cancelEdit();
        } catch (err) {
            toast.error(err?.data?.message || "Khong the cap nhat");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Tuy chon toan cuc
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Quan ly cac gia tri dung chung cho bien the san pham: mau sac, dung luong, RAM va phien ban.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                    icon={ListOrdered}
                    label="Tong tuy chon"
                    value={totalOptions}
                    className="bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                />
                <SummaryCard
                    icon={Palette}
                    label="Mau sac"
                    value={colorOptions}
                    className="bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                />
                <SummaryCard
                    icon={Check}
                    label="Mau da co ma"
                    value={configuredColors}
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                />
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    setActiveTab(value);
                    setSearch("");
                    cancelEdit();
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
                            Them {activeType?.label?.toLowerCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Thu tu nho hon se hien thi truoc trong form san pham.
                        </p>
                    </div>
                    <Badge variant="outline">{getOptionTypeLabel(activeTab)}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        placeholder="Them gia tri..."
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
                    <Input
                        type="number"
                        min={0}
                        placeholder="Thu tu"
                        value={newSortOrder}
                        onChange={(e) => setNewSortOrder(e.target.value)}
                        className="h-9 w-24 text-xs"
                    />
                    {activeTab === "COLOR" && (
                        <div className="flex items-center gap-1">
                            <input
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
                        Them
                    </Button>

                    <div className="relative ml-auto">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tim kiem..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-[180px] pl-8 text-xs"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                {isLoading ? (
                    <div className="space-y-2 p-4">
                        {[...Array(5)].map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        Chua co gia tri nao. Them gia tri dau tien o tren.
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-muted/50">
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">{activeTab === "COLOR" ? "Preview" : "Loai"}</th>
                                    <th className="px-4 py-3 font-medium">Gia tri</th>
                                    <th className="px-4 py-3 font-medium">Thu tu</th>
                                    <th className="px-4 py-3 text-right font-medium">Hanh dong</th>
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
                                                            type="color"
                                                            value={option.hex || "#cccccc"}
                                                            onChange={(e) => handleHexChange(option, e.target.value)}
                                                            className="h-7 w-7 cursor-pointer rounded border-0 p-0"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {option.hex || "Chua co ma"}
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
                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={editingSortOrder}
                                                        onChange={(e) => setEditingSortOrder(e.target.value)}
                                                        className="h-8 w-24 text-xs"
                                                    />
                                                ) : (
                                                    option.sortOrder ?? 0
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
                                                                Luu
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 rounded-full px-2 text-xs"
                                                                onClick={cancelEdit}
                                                            >
                                                                Huy
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 rounded-full px-2 text-xs"
                                                            onClick={() => startEdit(option)}
                                                        >
                                                            Sua
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                                                        disabled={isDeleting}
                                                        onClick={() => handleDelete(option.id)}
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
        </div>
    );
}
