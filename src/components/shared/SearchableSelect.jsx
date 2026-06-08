import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    disabled = false,
    className = "",
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const filtered = options.filter((o) =>
        (o.label || o.value || "").toLowerCase().includes(search.toLowerCase()),
    );

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        if (open && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [open]);

    const handleSelect = useCallback(
        (opt) => {
            onChange(opt.value);
            setOpen(false);
            setSearch("");
        },
        [onChange],
    );

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setOpen(false);
            setSearch("");
        }
        if (e.key === "Enter" && search && filtered.length > 0) {
            e.preventDefault();
            handleSelect(filtered[0]);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative min-w-0 max-w-full", className)}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={cn(
                    "flex h-9 w-full min-w-0 max-w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-xs transition-colors",
                    !disabled && "hover:border-foreground/50",
                    disabled && "cursor-not-allowed opacity-50",
                )}
            >
                <span className={cn("min-w-0 flex-1 truncate text-left", selected ? "text-foreground" : "text-muted-foreground")}>
                    {selected?.label || selected?.value || placeholder}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute left-0 z-50 mt-1 w-full min-w-[200px] rounded-md border border-border bg-popover shadow-lg">
                    <div className="flex items-center border-b border-border px-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm kiếm..."
                            className="h-8 border-0 bg-transparent px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                Không có kết quả
                            </div>
                        ) : (
                            filtered.map((opt, i) => (
                                <button
                                    key={opt.value + i}
                                    type="button"
                                    onClick={() => handleSelect(opt)}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted",
                                        opt.value === value && "bg-muted font-medium text-foreground",
                                    )}
                                >
                                    {opt.prefix}
                                    <span>{opt.label || opt.value}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
