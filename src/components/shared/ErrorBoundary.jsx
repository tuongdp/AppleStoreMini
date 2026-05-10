import { Component } from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                    <div className="mb-4 text-5xl">⚠️</div>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">
                        {"Đã xảy ra lỗi"}
                    </h2>
                    <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                        {this.state.error?.message ||
                            "Có lỗi không mong muốn xảy ra."}
                    </p>
                    <Button
                        className="rounded-full"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.href = "/";
                        }}
                    >
                        {"Về trang chủ"}
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
