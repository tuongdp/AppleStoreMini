import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function normalizeSpecs(specs) {
    if (Array.isArray(specs)) return specs;
    if (specs && typeof specs === "object") {
        return Object.entries(specs).map(([key, value]) => ({
            label: key,
            value: String(value ?? ""),
        }));
    }
    return [];
}

function groupSpecs(specs) {
    const list = normalizeSpecs(specs);
    if (!list.length) return [];
    const groups = [];
    let current = null;
    for (const spec of list) {
        const label = spec.label ?? spec.key ?? "";
        const value = spec.value ?? "";
        if (!value) {
            current = { header: label, items: [] };
            groups.push(current);
        } else if (current) {
            current.items.push({ label, value });
        } else {
            if (!groups.length) groups.push({ header: "", items: [] });
            groups[0].items.push({ label, value });
        }
    }
    return groups;
}

export default function SpecsAccordion({ specs = [], className }) {
    const groups = useMemo(() => groupSpecs(specs), [specs]);
    const [openSections, setOpenSections] = useState(() => {
        if (!groups.length) return {};
        return { 0: true };
    });

    const toggle = (idx) => {
        setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    if (!groups.length) return null;

    return (
        <div className={cn("space-y-2", className)}>
            {groups.map((group, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200",
                        openSections[idx] && "shadow-sm",
                    )}
                >
                    <button
                        type="button"
                        onClick={() => toggle(idx)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                        <span className="text-sm font-semibold text-foreground">
                            {group.header}
                        </span>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                                openSections[idx] && "rotate-180",
                            )}
                        />
                    </button>

                    <div
                        className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                            openSections[idx] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                    >
                        <div className="overflow-hidden">
                            <div className="px-4 pb-3">
                                {group.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-start justify-between gap-4 py-2 text-sm",
                                            i < group.items.length - 1 && "border-b border-border/50",
                                        )}
                                    >
                                        <span className="shrink-0 text-muted-foreground">
                                            {item.label}
                                        </span>
                                        <span className="text-right font-medium text-foreground">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
