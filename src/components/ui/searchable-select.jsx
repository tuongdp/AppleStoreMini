import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Chọn...",
    disabled = false,
    emptyText = "Không có dữ liệu",
    ...props
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) setSearch("");
    }, [open]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, search]);

    const selectedLabel = options.find((o) => o.code === value)?.label;

    const handleSelect = (code) => {
        onChange?.(code);
        setOpen(false);
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    data-testid={props["data-testid"]}
                    className={cn(
                        "flex w-full min-w-0 max-w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8",
                        !selectedLabel && "text-muted-foreground",
                    )}
                >
                    <span className="line-clamp-1 text-left">{selectedLabel || placeholder}</span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={4}
                    className="z-50 w-(--radix-popover-trigger-width) rounded-lg border bg-popover text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-muted-foreground">
                                {search ? "Không tìm thấy" : emptyText}
                            </p>
                        ) : (
                            filtered.map((opt) => (
                                <button
                                    key={opt.code}
                                    type="button"
                                    className={cn(
                                        "relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                        value === opt.code && "bg-accent text-accent-foreground",
                                    )}
                                    onClick={() => handleSelect(opt.code)}
                                >
                                    {opt.label}
                                </button>
                            ))
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
