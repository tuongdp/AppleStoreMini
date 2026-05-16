import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Send, Edit, Trash2, BarChart3, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
    useGetCampaignsQuery,
    useDeleteCampaignMutation,
    useSendCampaignMutation,
    useAutoGenerateCampaignMutation,
} from "@/store/api/emailMarketingApi";

const STATUS_MAP = {
    DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    SENDING: { label: "Đang gửi", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400" },
    SENT: { label: "Đã gửi", className: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" },
    FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400" },
};

export default function CampaignList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const [statsId, setStatsId] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [showAutoDialog, setShowAutoDialog] = useState(false);
    const [strategy, setStrategy] = useState("both");
    const limit = 10;

    const { data, isLoading } = useGetCampaignsQuery({ page, limit });
    const [deleteCampaign, { isLoading: deleting }] = useDeleteCampaignMutation();
    const [sendCampaign, { isLoading: sending }] = useSendCampaignMutation();
    const [autoGenerate, { isLoading: generating }] = useAutoGenerateCampaignMutation();

    const campaigns = data?.campaigns ?? [];
    const pagination = data?.pagination;
    const totalPages = pagination ? Math.ceil(pagination.total / limit) : 0;

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteCampaign(deleteId).unwrap();
            toast.success("Đã xóa chiến dịch");
            setDeleteId(null);
        } catch {
            toast.error("Không thể xóa chiến dịch");
        }
    };

    const handleSend = async (id) => {
        try {
            await sendCampaign(id).unwrap();
            toast.success("Đã gửi chiến dịch đến tất cả subscribers");
        } catch {
            toast.error("Gửi thất bại, vui lòng thử lại");
        }
    };

    const handleViewStats = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/email-campaigns/${id}/stats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")}` },
            });
            const json = await res.json();
            setStatsData(json.data ?? json);
            setStatsId(id);
        } catch {
            toast.error("Không thể tải thống kê");
        }
    };

    const handleAutoGenerate = async () => {
        try {
            const result = await autoGenerate(strategy).unwrap();
            setShowAutoDialog(false);
            toast.success(`AI đã tạo chiến dịch "${result.campaign?.subject}"`, {
                action: { label: "Xem", onClick: () => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_EDIT(result.campaign?.id)) },
            });
        } catch {
            toast.error("AI không thể tạo chiến dịch, thử lại sau");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                    {pagination ? `${pagination.total} chiến dịch` : ""}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowAutoDialog(true)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Tự tạo
                    </Button>
                    <Button onClick={() => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_CREATE)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo chiến dịch
                    </Button>
                </div>
            </div>

            <Card className="border-border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Đối tượng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Đã gửi</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="w-[180px]">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Chưa có chiến dịch nào.{" "}
                                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_CREATE)}>
                                            Tạo ngay
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigns.map((c) => {
                                    const status = STATUS_MAP[c.status] || STATUS_MAP.DRAFT;
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {c.subject}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {c.targetAudience || "all"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={status.className}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {c.totalSent ?? 0}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(c.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {(c.status === "DRAFT" || c.status === "SENT" || c.status === "FAILED") && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-green-500"
                                                                onClick={() => handleSend(c.id)}
                                                                disabled={sending}
                                                                title={c.status === "SENT" ? "Gửi lại" : "Gửi ngay"}
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                                                onClick={() => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_EDIT(c.id))}
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {(c.status === "SENT" || c.status === "SENDING") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                                            onClick={() => handleViewStats(c.id)}
                                                            title="Thống kê"
                                                        >
                                                            <BarChart3 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                                                        onClick={() => { setTestDialog({ open: true, campaignId: c.id }); setTestEmail(""); }}
                                                        title="Gửi test"
                                                    >
                                                        <Beaker className="h-4 w-4" />
                                                    )}
                                                    {(c.status === "DRAFT" || c.status === "SENT" || c.status === "FAILED") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                                            onClick={() => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_EDIT(c.id))}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {(c.status === "SENT" || c.status === "SENDING") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                                            onClick={() => handleViewStats(c.id)}
                                                            title="Thống kê"
                                                        >
                                                            <BarChart3 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                        onClick={() => setDeleteId(c.id)}
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Trang {page} / {totalPages} — {pagination?.total ?? 0} kết quả
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                            Trước
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                            Sau
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats dialog */}
            {statsData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setStatsData(null); setStatsId(null); }}>
                    <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-lg font-semibold">Thống kê chiến dịch</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Đã gửi</p>
                                    <p className="text-2xl font-bold">{statsData.totalSent ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Đã mở</p>
                                    <p className="text-2xl font-bold">{statsData.openedCount ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Đã click</p>
                                    <p className="text-2xl font-bold">{statsData.clickedCount ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Bounce</p>
                                    <p className="text-2xl font-bold">{statsData.bouncedCount ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tỉ lệ mở</p>
                                    <p className="text-2xl font-bold text-blue-600">{statsData.openRate ? `${statsData.openRate}%` : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tỉ lệ click</p>
                                    <p className="text-2xl font-bold text-green-600">{statsData.clickRate ? `${statsData.clickRate}%` : "—"}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => { setStatsData(null); setStatsId(null); }}>
                                Đóng
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* AI Auto Generate Dialog */}
            {showAutoDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAutoDialog(false)}>
                    <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                AI Tự động tạo chiến dịch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                AI sẽ phân tích sản phẩm và tự động tạo nội dung email marketing phù hợp.
                            </p>

                            <RadioGroup value={strategy} onValueChange={setStrategy}>
                                <div className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setStrategy("both")}>
                                    <RadioGroupItem value="both" id="both" />
                                    <div>
                                        <Label htmlFor="both" className="text-sm font-medium cursor-pointer">Kết hợp cả 2</Label>
                                        <p className="text-xs text-muted-foreground">Sản phẩm tồn kho + sản phẩm bán chạy</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setStrategy("push_inventory")}>
                                    <RadioGroupItem value="push_inventory" id="push" />
                                    <div>
                                        <Label htmlFor="push" className="text-sm font-medium cursor-pointer">Đẩy hàng tồn</Label>
                                        <p className="text-xs text-muted-foreground">Sản phẩm còn tồn, ít bán, ít lượt xem</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setStrategy("hot_products")}>
                                    <RadioGroupItem value="hot_products" id="hot" />
                                    <div>
                                        <Label htmlFor="hot" className="text-sm font-medium cursor-pointer">Sản phẩm hot</Label>
                                        <p className="text-xs text-muted-foreground">Sản phẩm bán chạy, nhiều lượt xem</p>
                                    </div>
                                </div>
                            </RadioGroup>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowAutoDialog(false)}>Hủy</Button>
                                <Button onClick={handleAutoGenerate} disabled={generating}>
                                    {generating ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo...</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-4 w-4" />Tạo chiến dịch</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteId}
                title="Xóa chiến dịch?"
                description="Chiến dịch sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
