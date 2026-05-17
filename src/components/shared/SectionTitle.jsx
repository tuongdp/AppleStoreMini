import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
export default function SectionTitle({
  title,
  viewAllHref,
  viewAllLabel,
  align = "left", // left | center
  className,
}) {
  const shouldUseDocumentNavigation =
    typeof viewAllHref === "string" &&
    (viewAllHref.startsWith("/products") || viewAllHref.startsWith("/news"));

  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      {/* Text group */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
      </div>

      {/* View all link */}
      {viewAllHref && align !== "center" && (
        <Link
          to={viewAllHref}
          reloadDocument={shouldUseDocumentNavigation}
          className="group flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          {viewAllLabel || "Xem tất cả"}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* View all button center align */}
      {viewAllHref && align === "center" && (
        <Link
          to={viewAllHref}
          reloadDocument={shouldUseDocumentNavigation}
          className="group mt-2 flex items-center gap-0.5 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          {viewAllLabel || "viewAll"}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
