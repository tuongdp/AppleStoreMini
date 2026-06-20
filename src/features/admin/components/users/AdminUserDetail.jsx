import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Mail, Phone, ShoppingBag, Shield, ShieldCheck, ShieldOff, MapPin, Clock, KeyRound,
    Search, ChevronLeft, ChevronRight, User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import {
    useToggleUserStatusMutation, useUpdateUserRoleMutation, useResetUserPasswordMutation,
} from "@/store/api/usersApi";
import { useGetAllOrdersQuery } from "@/store/api/ordersApi";
import { selectCurrentUser, selectIsAdmin } from "@/store/authSlice";
import { formatPrice, formatDate, formatDateTime, formatNumber, formatPhone } from "@/lib/utils";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

const ROLE_CONFIG = {
    admin: { label: "Quản trị viên", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
    staff: { label: "Nhân viên", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
    user: { label: "Khách hàng", color: "bg-muted text-muted-foreground" },
};

export default function AdminUserDetail({ user }) {
    const isAdmin = useSelector(selectIsAdmin);
    const currentUser = useSelector(selectCurrentUser);
    const [pendingAction, setPendingAction] = useState(null);
    const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
    const [toggleStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();

    const [orderPage, setOrderPage] = useState(1);
    const [orderSearch, setOrderSearch] = useState("");
    const [orderStatus, setOrderStatus] = useState("");

    const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({
        page: orderPage, limit: 5, userId: user.id, search: orderSearch || undefined, status: orderStatus || undefined,
    });

    const orders = ordersData?.orders ?? [];
    const orderPagination = ordersData?.pagination ?? {};

    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
    const isSelf = String(user.id) === String(currentUser?.id);
    const canChangeRole = isAdmin && !isSelf && user.role !== "admin";
    const canToggleStatus = isAdmin && !isSelf && user.role !== "admin";

    const handleSetRole = async (role) => {
        if (!canChangeRole) { toast.error("Không thể thay đổi vai trò của tài khoản này"); return; }
        if (role === user.role) return;
        try {
            await updateRole({ id: user.id, role }).unwrap();
            toast.success("Đã cập nhật vai trò");
        } catch { toast.error("Có lỗi xảy ra"); }
    };

    const handleToggleStatus = async () => {
        if (!canToggleStatus) { toast.error("Không thể thay đổi trạng thái tài khoản này"); return; }
        try {
            await toggleStatus(user.id).unwrap();
            toast.success(user.isBlocked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
        } catch { toast.error("Có lỗi xảy ra"); }
    };

    const requestStatusToggle = () => {
        setPendingAction({
            type: "status",
            title: user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản",
            description: user.isBlocked ? `${user.fullName || user.email} sẽ có thể đăng nhập và sử dụng tài khoản trở lại.` : `${user.fullName || user.email} sẽ không thể đăng nhập hoặc sử dụng tài khoản cho đến khi được mở khóa.`,
            confirmLabel: user.isBlocked ? "Mở khóa" : "Khóa tài khoản",
            variant: user.isBlocked ? "default" : "destructive",
        });
    };

    const requestRoleChange = (role) => {
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
        setPendingAction({
            type: "role", role,
            title: "Cập nhật vai trò người dùng",
            description: `Chuyển ${user.fullName || user.email} sang vai trò ${config.label}. Quyền truy cập admin sẽ thay đổi ngay sau khi lưu.`,
            confirmLabel: "Cập nhật vai trò", variant: "default",
        });
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        if (pendingAction.type === "role") await handleSetRole(pendingAction.role);
        if (pendingAction.type === "status") await handleToggleStatus();
        setPendingAction(null);
    };

    const [resetOpen, setResetOpen] = useState(false);

    const handleResetPassword = async () => {
        try {
            await resetPassword({ id: user.id }).unwrap();
            setResetOpen(false);
            toast.success("Mật khẩu mới đã được gửi đến email");
        } catch (error) { toast.error(error?.data?.message || "Đặt lại mật khẩu thất bại"); }
    };

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="bg-linear-to-b from-muted/50 to-card p-6 md:p-8">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20 shrink-0 ring-4 ring-background">
                            <AvatarImage src={user.avatar} alt={user.fullName || user.email || "Người dùng"} />
                            <AvatarFallback className="text-2xl font-semibold">{user.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-bold text-foreground">{user.fullName || "Người dùng chưa cập nhật tên"}</h1>
                            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
                                <Badge className={!user.isBlocked ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"}>
                                    {!user.isBlocked ? "Đang hoạt động" : "Đã khóa"}
                                </Badge>
                                {user.isVerified && <Badge variant="outline" className="border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400">Đã xác thực</Badge>}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user.email || "—"}</span>
                                {user.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{formatPhone(user.phone)}</span>}
                                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Tham gia {formatDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thống kê</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard icon={ShoppingBag} label="Đơn hàng" value={formatNumber(user.orderCount ?? 0)} iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" />
                            <StatCard icon={ShoppingBag} label="Tổng chi" value={formatPrice(user.totalSpent ?? 0)} iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" />
                        </div>
                    </div>

                    {user.address && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Địa chỉ</h3>
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"><MapPin className="h-4 w-4" /></div>
                                <p className="text-sm leading-relaxed text-foreground">{user.address}</p>
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <div className="mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quản lý tài khoản</h3></div>
                            <div className="grid grid-cols-1 gap-2">
                                {canChangeRole && (
                                    <>
                                        <Button variant="outline" size="sm" className="justify-start rounded-lg" disabled={isUpdatingRole} onClick={() => requestRoleChange("admin")}><ShieldCheck className="mr-2 h-4 w-4" />Đặt làm quản trị viên</Button>
                                        <Button variant="outline" size="sm" className="justify-start rounded-lg" disabled={isUpdatingRole} onClick={() => requestRoleChange("staff")}><Shield className="mr-2 h-4 w-4" />Đặt làm nhân viên</Button>
                                        <Button variant="outline" size="sm" className="justify-start rounded-lg" disabled={isUpdatingRole} onClick={() => requestRoleChange("user")}><User className="mr-2 h-4 w-4" />Đặt làm khách hàng</Button>
                                        <Separator className="my-1" />
                                    </>
                                )}
                                <Button variant={user.isBlocked ? "outline" : "destructive"} size="sm" className="justify-start rounded-lg" disabled={isTogglingStatus || !canToggleStatus} onClick={requestStatusToggle}><ShieldOff className="mr-2 h-4 w-4" />{user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}</Button>
                                <Separator className="my-1" />
                                <Button variant="outline" size="sm" className="justify-start rounded-lg" disabled={isResetting} onClick={() => setResetOpen(true)}><KeyRound className="mr-2 h-4 w-4" />Đặt lại mật khẩu</Button>
                            </div>
                            {isSelf && <p className="mt-3 text-xs text-muted-foreground">Không thể tự khóa, xóa hoặc hạ quyền tài khoản đang đăng nhập.</p>}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-muted-foreground" /><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lịch sử đơn hàng</h3><Badge variant="secondary" className="text-xs">{orderPagination.totalItems ?? orders.length} đơn</Badge></div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative w-full sm:w-44"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Tìm mã đơn..." className="h-8 rounded-lg pl-8 text-xs" value={orderSearch} onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }} /></div>
                                <Select value={orderStatus || "all"} onValueChange={(v) => { setOrderStatus(v === "all" ? "" : v); setOrderPage(1); }}>
                                    <SelectTrigger className="h-8 w-36 rounded-lg text-xs"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                        <SelectItem value="SHIPPING">Đang giao</SelectItem>
                                        <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {ordersLoading ? (
                            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted"><ShoppingBag className="h-6 w-6 text-muted-foreground" /></div><p className="text-sm font-medium text-foreground">{orderSearch || orderStatus ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}</p></div>
                        ) : (
                            <>
                                <div className="space-y-0.5">
                                    {orders.map((order) => (
                                        <Link key={order.id} to={ROUTES.ADMIN_ORDER_DETAIL(order.id)} className="block rounded-lg transition-colors hover:bg-muted/50">
                                            <div className="grid grid-cols-1 gap-1 px-3 py-3 md:grid-cols-12 md:gap-0 md:py-2.5">
                                                <span className="col-span-4 text-sm font-medium text-foreground">#{order.code}</span>
                                                <span className="col-span-2"><OrderStatusBadge status={order.status} /></span>
                                                <span className="col-span-2 text-xs text-muted-foreground">{order.items?.length ?? 0} sản phẩm</span>
                                                <span className="col-span-2 text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                                                <span className="col-span-2 text-sm font-medium text-foreground md:text-right">{formatPrice(order.totalAmount)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {orderPagination.totalPages > 1 && (
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <Button variant="outline" size="sm" className="rounded-full" disabled={orderPage <= 1} onClick={() => setOrderPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                                        <span className="text-xs text-muted-foreground">{orderPage} / {orderPagination.totalPages}</span>
                                        <Button variant="outline" size="sm" className="rounded-full" disabled={orderPage >= orderPagination.totalPages} onClick={() => setOrderPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)} title={pendingAction?.title} description={pendingAction?.description} confirmLabel={pendingAction?.confirmLabel} variant={pendingAction?.variant} onConfirm={handleConfirmAction} isLoading={isUpdatingRole || isTogglingStatus} />

            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Đặt lại mật khẩu</DialogTitle><DialogDescription>Mật khẩu mới sẽ được tạo ngẫu nhiên và gửi đến email {user.email}.</DialogDescription></DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setResetOpen(false)}>Hủy</Button>
                        <Button className="rounded-full" onClick={handleResetPassword} disabled={isResetting}>{isResetting ? "Đang gửi..." : "Gửi mật khẩu mới"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, iconClassName }) {
    return (
        <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}><Icon className="h-4 w-4" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold text-foreground">{value}</p></div>
        </div>
    );
}
