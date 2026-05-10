import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { ShieldCheck, Lock } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function CheckoutLayout() {
    const { t: tCheckout } = useTranslation("checkout");
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col bg-muted/30">
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                    <Link
                        to={ROUTES.HOME}
                        className="transition-opacity hover:opacity-70"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 814 1000"
                            className="h-7 w-7 fill-foreground"
                        >
                            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
                        </svg>
                    </Link>

                    <h1 className="text-sm font-medium text-foreground">
                        {tCheckout("title")}
                    </h1>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                            {tCheckout("payment.secure")}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <Outlet />
                </div>
            </main>

            <footer className="border-t border-border py-6">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center">
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            {tCheckout("payment.secure")}
                        </span>
                        <span>{t("footer.privacy")}</span>
                        <span>{t("footer.terms")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t("footer.copyright")}
                    </p>
                </div>
            </footer>
        </div>
    );
}
