import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyEmailMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function VerifyEmailPage() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
    const token = searchParams.get("token");
    const [status, setStatus] = useState(token ? "verifying" : "invalid");

    useEffect(() => {
        if (!token) return;
        verifyEmail({ token })
            .unwrap()
            .then(() => {
                setStatus("success");
                setTimeout(() => navigate(ROUTES.HOME, { replace: true }), 1500);
            })
            .catch((err) => {
                const msg = err?.data?.message;
                if (msg?.includes("đã được xác thực")) {
                    setStatus("already");
                } else {
                    setStatus("invalid");
                }
            });
    }, [token, verifyEmail, navigate]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
            {isLoading ? (
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-muted-foreground" />
            ) : status === "success" || status === "already" ? (
                <>
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold text-foreground">
                        {status === "success" ? t("verify.success") : t("verify.alreadyVerified")}
                    </h1>
                    <p className="mb-8 text-sm text-muted-foreground">
                        {t("verify.successDesc")}
                    </p>
                    <Button className="rounded-full px-8" asChild>
                        <Link to={ROUTES.HOME}>{t("common:home")}</Link>
                    </Button>
                </>
            ) : (
                <>
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold text-foreground">
                        {t("verify.invalid")}
                    </h1>
                    <p className="mb-8 text-sm text-muted-foreground">
                        {t("verify.invalidDesc")}
                    </p>
                    <Button className="rounded-full px-8" asChild>
                        <Link to={ROUTES.LOGIN}>{t("login.title")}</Link>
                    </Button>
                </>
            )}
        </div>
    );
}