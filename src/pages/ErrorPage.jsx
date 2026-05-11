import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

const IS_DEV = import.meta.env.DEV;

export default function ErrorPage() {
    const error = useRouteError();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                {IS_DEV ? (
                    <Bug className="h-10 w-10 text-amber-500" />
                ) : (
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                )}
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
                {IS_DEV ? "Lỗi Runtime" : "Đã xảy ra lỗi"}
            </h1>
            <p className="mb-2 max-w-md text-sm text-muted-foreground">
                {IS_DEV
                    ? "Chi tiết lỗi bên dưới (chỉ hiển thị ở môi trường dev):"
                    : error?.message || error?.statusText || "Có lỗi không mong muốn xảy ra. Vui lòng thử lại."}
            </p>
            {error?.status && !IS_DEV && (
                <p className="mb-6 text-5xl font-bold text-muted-foreground/30">
                    {error.status}
                </p>
            )}
            {IS_DEV && error && (
                <div className="mb-6 w-full max-w-2xl overflow-auto rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
                    <p className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                        {error?.message || String(error)}
                    </p>
                    {error?.stack && (
                        <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                            {error.stack}
                        </pre>
                    )}
                </div>
            )}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Thử lại
                </Button>
                <Button asChild className="rounded-full">
                    <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        Về trang chủ
                    </Link>
                </Button>
            </div>
        </div>
    );
}
