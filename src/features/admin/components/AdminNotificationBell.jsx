import { useState, useCallback } from "react";
import { Bell, Check, Sparkles, BarChart3, ShoppingCart, Megaphone, AlertTriangle, Tag, Rocket, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    useGetNotificationsQuery,
    useMarkReadMutation,
    useMarkResolvedMutation,
    useDismissNotificationMutation,
    useRunAnalysisMutation,
} from "@/store/api/notificationApi";
import { useSocket } from "@/hooks/useSocket";

const TYPE_ICONS = {
    INVENTORY_WARNING: ShoppingCart,
    SALES_DROP: BarChart3,
    MARKETING_SUGGESTION: Megaphone,
    FORECAST_ALERT: AlertTriangle,
    AI_REPORT: Sparkles,
};

const SEVERITY_COLORS = {
    LOW: "bg-blue-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-orange-500",
    CRITICAL: "bg-red-500",
};

export default function AdminNotificationBell() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { data, isLoading } = useGetNotificationsQuery({ limit: 20, status: "unread" });
    const [markRead] = useMarkReadMutation();
    const [markResolved] = useMarkResolvedMutation();
    const [dismiss] = useDismissNotificationMutation();
    const [runAnalysis, { isLoading: analyzing }] = useRunAnalysisMutation();

    const handleNew = useCallback(() => { }, []);
    const handleNewOrder = useCallback((order) => {
        toast.success(`🛒 Đơn hàng mới #${order.orderCode} — ${order.totalAmount?.toLocaleString("vi-VN")}đ`, {
            action: { label: "Xem", onClick: () => navigate(`/admin/orders/${order.orderId}`) },
        });
    }, [navigate]);
    useSocket(handleNew, handleNewOrder);

    const notifications = data?.notifications ?? [];
    const unreadCount = data?.unreadCount ?? 0;

    const handleAction = (notif) => {
        markRead(notif.id);
        if (notif.actionType === "CREATE_CAMPAIGN" && notif.actionPayload) {
            navigate(`/admin/email-campaigns/create?productId=${notif.actionPayload.productId}&productName=${encodeURIComponent(notif.actionPayload.productName)}&productPrice=${notif.actionPayload.productPrice}`);
        } else if (notif.actionType === "VIEW_PRODUCT" && notif.actionPayload?.productSlug) {
            navigate(`/product/${notif.actionPayload.productSlug}`);
        } else if (notif.actionType === "VIEW_REPORT") {
            navigate("/admin/dashboard");
        } else {
            toast.info(notif.title);
        }
        setOpen(false);
    };

    const handleRunAnalysis = async () => {
        try {
            const result = await runAnalysis().unwrap();
            toast.success(`AI đã tạo ${result.length} cảnh báo mới`);
        } catch {
            toast.error("AI phân tích thất bại, thử lại sau");
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9"
                onClick={() => setOpen(!open)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </Button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <Card className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[500px] overflow-hidden shadow-xl border-border">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                AI Cảnh báo & Đề xuất
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={handleRunAnalysis}
                                disabled={analyzing}
                            >
                                {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                Phân tích ngay
                            </Button>
                        </div>

                        <div className="overflow-y-auto max-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                    <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Không có cảnh báo nào</p>
                                    <p className="text-xs text-muted-foreground mt-1">AI đang theo dõi hệ thống của bạn</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const Icon = TYPE_ICONS[n.type] || Sparkles;
                                    const sevColor = SEVERITY_COLORS[n.severity] || SEVERITY_COLORS.MEDIUM;

                                    return (
                                        <div
                                            key={n.id}
                                            className={`border-b border-border last:border-b-0 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${n.status === "UNREAD" ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${sevColor}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                        <p className="text-sm font-medium truncate">{n.title}</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{n.message}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                            {n.type === "INVENTORY_WARNING" ? "Tồn kho" :
                                                                n.type === "SALES_DROP" ? "Doanh thu" :
                                                                    n.type === "MARKETING_SUGGESTION" ? "Marketing" : "AI"}</Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(n.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                                                        </span>
                                                    </div>
                                                    {n.actionType && (
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-7 text-xs gap-1"
                                                                onClick={(e) => { e.stopPropagation(); handleAction(n); }}
                                                            >
                                                                {n.actionType === "CREATE_CAMPAIGN" && <><Megaphone className="h-3 w-3" /> Tạo campaign</>}
                                                                {n.actionType === "VIEW_PRODUCT" && <><ShoppingCart className="h-3 w-3" /> Xem SP</>}
                                                                {n.actionType === "CREATE_VOUCHER" && <><Tag className="h-3 w-3" /> Tạo voucher</>}
                                                                {n.actionType === "VIEW_REPORT" && <><BarChart3 className="h-3 w-3" /> Xem báo cáo</>}
                                                                {n.actionType === "RESTOCK" && <><Rocket className="h-3 w-3" /> Nhập hàng</>}
                                                                {n.actionType === "CREATE_FLASH_SALE" && <><Rocket className="h-3 w-3" /> Flash Sale</>}
                                                                <ChevronRight className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-muted-foreground"
                                                                onClick={(e) => { e.stopPropagation(); markResolved(n.id); }}
                                                            >
                                                                <Check className="h-3 w-3 mr-1" /> Xong
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-muted-foreground"
                                                                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                                                            >
                                                                Bỏ qua
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
