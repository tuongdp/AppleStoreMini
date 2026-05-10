import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Package, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ROUTES, PAYMENT_METHODS } from "@/lib/constants";

export default function OrderSuccess({ order, onMoMoPayment, isPaying }) {
    const { t } = useTranslation("checkout");
    const isMoMo = order?.paymentMethod?.toLowerCase() === PAYMENT_METHODS.MOMO;

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="mb-2 text-2xl font-semibold text-foreground">
                {t("success.title")}
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
                {t("success.subtitle")}
            </p>

            <div className="mb-8 w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-left">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {t("success.orderCode")}
                    </span>
                    <span className="font-semibold text-foreground">
                        #{order?.code}
                    </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {t("detail.orderDate", { ns: "order" })}
                    </span>
                    <span className="text-sm text-foreground">
                        {formatDateTime(order?.createdAt)}
                    </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {t("confirm.total")}
                    </span>
                    <span className="font-semibold text-foreground">
                        {formatPrice(order?.totalAmount)}
                    </span>
                </div>

                <Separator className="mb-4" />

                {order?.items?.length > 0 && (
                    <div className="space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-foreground">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        x{item.quantity}
                                        {item.color && <span> · {item.color}</span>}
                                        {item.storage && <span> · {item.storage}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                                {t("success.moreItems", { count: order.items.length - 3 })}
                            </p>
                        )}
                    </div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                    <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        {t("success.estimatedDelivery")}:{" "}
                        <span className="font-medium text-foreground">
                            3-5 {t("success.days")}
                        </span>
                    </p>
                </div>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                    {t("success.orderInfo")}
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                {isMoMo && (
                    <Button
                        className="rounded-full px-8"
                        onClick={() => onMoMoPayment(order?.id)}
                        disabled={isPaying}
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        {isPaying ? t("confirm.placing") : t("momoPayNow")}
                    </Button>
                )}
                <Button className="rounded-full px-8" asChild>
                    <Link to={ROUTES.ORDER_DETAIL(order?.id)}>
                        {t("success.trackOrder")}
                    </Link>
                </Button>
                <Button variant="outline" className="rounded-full px-8" asChild>
                    <Link to={ROUTES.PRODUCTS}>
                        {t("success.continueShopping")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
