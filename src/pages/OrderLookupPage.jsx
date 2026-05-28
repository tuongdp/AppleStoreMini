import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Search,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useLookupOrderQuery } from "@/store/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { formatDateTime, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { productPlaceholder } from "@/assets/images";

const STATUS_MAP = {
    PENDING: { label: "Chờ xác nhận", icon: Clock, tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
    CONFIRMED: { label: "Đã xác nhận", icon: CheckCircle2, tone: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
    PROCESSING: { label: "Đang xử lý", icon: Package, tone: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" },
    SHIPPING: { label: "Đang giao", icon: Truck, tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" },
    DELIVERED: { label: "Đã giao", icon: CheckCircle2, tone: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
    CANCELLED: { label: "Đã huỷ", icon: XCircle, tone: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
    REFUNDING: { label: "Đang hoàn tiền", icon: Clock, tone: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" },
    REFUNDED: { label: "Đã hoàn tiền", icon: CheckCircle2, tone: "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_MAP[status] || STATUS_MAP.PENDING;
    const Icon = cfg.icon;
    return (
        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", cfg.tone)}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
        </div>
    );
}

function TimelineStep({ item, isLast }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    "border-primary bg-card",
                )}>
                    <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                {!isLast && <div className="mt-1 w-0.5 flex-1 bg-border" />}
            </div>
            <div className="pb-5">
                <p className="text-sm font-medium text-foreground">
                    {STATUS_MAP[item.status]?.label || item.status}
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                </p>
                {item.note && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
                )}
            </div>
        </div>
    );
}

export default function OrderLookupPage() {
    const [urlSearchParams] = useSearchParams();
    const initialCode = (urlSearchParams.get("code") || "").toUpperCase();
    const [code, setCode] = useState(initialCode);
    const [searchParams, setSearchParams] = useState(
        initialCode ? { code: initialCode } : null,
    );

    const { data: order, isLoading, isError, error } = useLookupOrderQuery(
        searchParams,
        { skip: !searchParams },
    );

    const handleLookup = (e) => {
        e.preventDefault();
        const trimmedCode = code.trim();
        if (!trimmedCode) return;
        setSearchParams({ code: trimmedCode });
    };

    const statusCfg = order ? STATUS_MAP[order.status] || STATUS_MAP.PENDING : null;
    const StatusIcon = statusCfg?.icon;

    return (
        <div className="section-padding py-8 md:py-12">
            <Breadcrumb items={[{ label: "Tra cứu đơn hàng" }]} className="mb-6" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                        Tra cứu đơn hàng
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Nhập mã đơn hàng để kiểm tra trạng thái đơn hàng của bạn
                    </p>
                </div>

                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <form onSubmit={handleLookup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="order-code">Mã đơn hàng</Label>
                                <Input
                                    id="order-code"
                                    placeholder="VD: ORD-XXX-XXX"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="font-mono text-center text-lg tracking-wider"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full rounded-full"
                                disabled={isLoading || !code.trim()}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="mr-2 h-4 w-4" />
                                )}
                                {isLoading ? "Đang tra cứu..." : "Tra cứu"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {isError && searchParams && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20">
                        <CardContent className="flex items-center gap-3 py-4">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                    Không tìm thấy đơn hàng
                                </p>
                                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                                    {error?.data?.message || "Vui lòng kiểm tra lại mã đơn hàng."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {order && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Đơn hàng #{order.code}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDateTime(order.createdAt)}
                                    </p>
                                </div>
                                <StatusBadge status={order.status} />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg bg-muted/30 p-4">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Người nhận</p>
                                            <p className="font-medium text-foreground">
                                                {order.shippingFullName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                                            <p className="font-medium text-foreground">
                                                {order.shippingPhone}
                                            </p>
                                        </div>
                                        {order.shippingEmail && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-muted-foreground">Email</p>
                                                <p className="font-medium text-foreground">
                                                    {order.shippingEmail}
                                                </p>
                                            </div>
                                        )}
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground">Phương thức thanh toán</p>
                                            <p className="font-medium text-foreground">
                                                {order.paymentMethod === "VNPAY" ? "VNPay" : "Thanh toán khi nhận hàng"}
                                                {order.paymentMethod === "VNPAY" && (
                                                    <span className="ml-2">
                                                        {order.isPaid
                                                            ? <Badge variant="success" className="inline-flex text-xs">Đã thanh toán</Badge>
                                                            : <Badge variant="secondary" className="inline-flex text-xs">Chưa thanh toán</Badge>
                                                        }
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className="mb-3 text-sm font-medium text-foreground">
                                        Sản phẩm ({order.items?.length || 0})
                                    </p>
                                    <div className="space-y-3">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                                    <ResponsiveImage
                                                        src={item.image}
                                                        fallbackSrc={productPlaceholder}
                                                        alt={item.name}
                                                        width={56}
                                                        height={56}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.color && <span>{item.color}</span>}
                                                        {item.storage && <span> · {item.storage}</span>}
                                                        {item.ram && <span> · {item.ram}</span>}
                                                        <span> · SL: {item.quantity}</span>
                                                    </p>
                                                </div>
                                                <PriceDisplay
                                                    price={item.price * item.quantity}
                                                    className="text-sm font-medium text-foreground"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tạm tính</span>
                                        <PriceDisplay price={order.subtotal} />
                                    </div>
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600 dark:text-green-400">
                                            <span>Giảm giá</span>
                                            <span>-<PriceDisplay price={order.discountAmount} /></span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phí vận chuyển</span>
                                        <span>{order.shippingFee > 0 ? <PriceDisplay price={order.shippingFee} /> : "Miễn phí"}</span>
                                    </div>
                                    <Separator className="my-1.5" />
                                    <div className="flex justify-between font-semibold text-foreground">
                                        <span>Tổng cộng</span>
                                        <PriceDisplay price={order.totalAmount} />
                                    </div>
                                </div>

                                {order.note && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Ghi chú</p>
                                            <p className="text-sm text-foreground">{order.note}</p>
                                        </div>
                                    </>
                                )}

                                {order.cancelReason && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Lý do huỷ</p>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {order.cancelReason}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {order.statusHistory?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Lịch sử trạng thái</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        {order.statusHistory.map((step, i) => (
                                            <TimelineStep
                                                key={i}
                                                item={step}
                                                isFirst={i === 0}
                                                isLast={i === order.statusHistory.length - 1}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Bạn đã có tài khoản?{" "}
                        <Link to={ROUTES.ORDERS} className="font-medium text-primary hover:underline">
                            Xem tất cả đơn hàng
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
