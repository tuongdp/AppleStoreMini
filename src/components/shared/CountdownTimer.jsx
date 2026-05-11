import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function CountdownTimer({ endTime, className, size = "md" }) {
    const [remaining, setRemaining] = useState(() => calcRemaining(endTime));

    useEffect(() => {
        const timer = setInterval(() => setRemaining(calcRemaining(endTime)), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (!remaining) return null;

    const pad = (n) => String(n).padStart(2, "0");
    const boxSize = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
    const textColor = "text-amber-600 dark:text-amber-400";
    const bgColor = "bg-amber-500/15 dark:bg-amber-400/20";

    return (
        <div className={cn("flex items-center gap-1 font-mono tabular-nums", className)}>
            {remaining.d > 0 && (
                <>
                    <span className={cn("flex items-center justify-center rounded-md text-xs font-bold shadow-sm", boxSize, textColor, bgColor)}>
                        {pad(remaining.d)}
                    </span>
                    <span className="mr-0.5 text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70">
                        {"ngày"}
                    </span>
                </>
            )}
            <span className={cn("flex items-center justify-center rounded-md font-bold shadow-sm", boxSize, textColor, bgColor)}>
                {pad(remaining.h)}
            </span>
            <span className="text-sm font-bold text-amber-500/50 dark:text-amber-400/50">:</span>
            <span className={cn("flex items-center justify-center rounded-md font-bold shadow-sm", boxSize, textColor, bgColor)}>
                {pad(remaining.m)}
            </span>
            <span className="text-sm font-bold text-amber-500/50 dark:text-amber-400/50">:</span>
            <span className={cn("flex items-center justify-center rounded-md font-bold shadow-sm", boxSize, textColor, bgColor)}>
                {pad(remaining.s)}
            </span>
        </div>
    );
}

function calcRemaining(endTime) {
    if (!endTime) return null;
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    const totalSec = Math.floor(diff / 1000);
    return {
        d: Math.floor(totalSec / 86400),
        h: Math.floor((totalSec % 86400) / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
    };
}
