import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function PaymentResult({ status }) {
    const { t } = useTranslation("checkout");
    const [searchParams] = useSearchParams();

    const moMoResultCode = searchParams.get("resultCode");
    const isSuccess = moMoResultCode !== null
        ? moMoResultCode === "0"
        : status === "success";

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                isSuccess ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/30"
            }`}>
                {isSuccess ? (
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
                {isSuccess ? t("paymentSuccess") : t("paymentFailed")}
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
                {isSuccess ? t("paymentSuccessDesc") : t("paymentFailedDesc")}
            </p>
            <div className="flex gap-3">
                <Button className="rounded-full px-8" asChild>
                    <Link to={ROUTES.ORDERS}>{t("success.trackOrder")}</Link>
                </Button>
                <Button variant="outline" className="rounded-full px-8" asChild>
                    <Link to={ROUTES.PRODUCTS}>{t("success.continueShopping")}</Link>
                </Button>
            </div>
        </div>
    );
}