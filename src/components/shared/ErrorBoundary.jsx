import { Component } from "react";
import { Button } from "@/components/ui/button";
import { Bug, RefreshCw, Home } from "lucide-react";

const IS_DEV = import.meta.env.DEV;

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        this.setState({ errorInfo: info });
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            const { error, errorInfo } = this.state;
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        {IS_DEV ? (
                            <Bug className="h-10 w-10 text-amber-500" />
                        ) : (
                            <span className="text-4xl">⚠️</span>
                        )}
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">
                        {IS_DEV ? "Lỗi Runtime" : "Đã xảy ra lỗi"}
                    </h2>
                    <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                        {error?.message || "Có lỗi không mong muốn xảy ra."}
                    </p>
                    {IS_DEV && error && (
                        <div className="mb-6 w-full max-w-2xl overflow-auto rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
                            <p className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                                {error.message}
                            </p>
                            {error.stack && (
                                <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                                    {error.stack}
                                </pre>
                            )}
                            {errorInfo?.componentStack && (
                                <>
                                    <p className="mt-3 mb-1 text-xs font-semibold text-muted-foreground">
                                        Component Stack:
                                    </p>
                                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                                        {errorInfo.componentStack}
                                    </pre>
                                </>
                            )}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                                this.setState({ hasError: false, error: null, errorInfo: null });
                                window.location.reload();
                            }}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Thử lại
                        </Button>
                        <Button
                            className="rounded-full"
                            onClick={() => {
                                this.setState({ hasError: false, error: null, errorInfo: null });
                                window.location.href = "/";
                            }}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
