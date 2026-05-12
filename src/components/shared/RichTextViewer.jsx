import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

/**
 * RichTextViewer — hiển thị HTML content từ TipTap editor
 * Dùng Tailwind Typography (prose) để style
 */
export default function RichTextViewer({ content, className }) {
    if (!content) return null;

    return (
        <div
            className={cn(
                "prose prose-sm max-w-none dark:prose-invert",
                "prose-headings:font-semibold prose-headings:tracking-tight",
                "prose-a:text-apple-blue prose-a:no-underline hover:prose-a:underline",
                "prose-img:rounded-xl prose-img:shadow-sm",
                "prose-blockquote:border-l-foreground/20 prose-blockquote:text-muted-foreground",
                className,
            )}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
    );
}
