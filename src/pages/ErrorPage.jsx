import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
    const error = useRouteError();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
                Đã xảy ra lỗi
            </h1>
            <p className="mb-2 max-w-md text-sm text-muted-foreground">
                {error?.message || error?.statusText || "Có lỗi không mong muốn xảy ra. Vui lòng thử lại."}
            </p>
            {error?.status && (
                <p className="mb-6 text-5xl font-bold text-muted-foreground/30">
                    {error.status}
                </p>
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
