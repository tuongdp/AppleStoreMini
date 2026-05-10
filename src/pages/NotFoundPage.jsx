import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            {/* 404 number */}
            <h1 className="text-[120px] font-bold leading-none text-muted-foreground/20 md:text-[160px]">
                404
            </h1>

            <div className="-mt-4">
                <h2 className="mb-3 text-2xl font-semibold text-foreground">
                    {"notFound"}
                </h2>
                <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                    {"notFoundDesc"}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to={ROUTES.HOME}
                        className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
                    >
                        {"goHome"}
                    </Link>
                    <Link
                        to={ROUTES.PRODUCTS}
                        className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        {"products"}
                    </Link>
                </div>
            </div>
        </div>
    );
}
