import { useEffect, useState } from "react";
import { ThemeProviderContext } from "@/providers/theme-context";

const getSystemTheme = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "app-ui-theme",
    ...props
}) {
    const [theme, setThemeState] = useState(() => {
        // Guard cho trường hợp không có localStorage
        try {
            return localStorage.getItem(storageKey) || defaultTheme;
        } catch {
            return defaultTheme;
        }
    });

    const [resolvedTheme, setResolvedTheme] = useState(() =>
        theme === "system" ? getSystemTheme() : theme,
    );

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (current) => {
            const final = current === "system" ? getSystemTheme() : current;
            root.classList.remove("light", "dark");
            root.classList.add(final);
            setResolvedTheme(final); // ✅ gọi 1 lần duy nhất ở đây
        };

        applyTheme(theme);

        // Chỉ lắng nghe system change khi đang ở chế độ "system"
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => applyTheme("system");

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (newTheme) => {
        try {
            localStorage.setItem(storageKey, newTheme);
        } catch { /* noop */ }
        setThemeState(newTheme);
    };

    return (
        <ThemeProviderContext.Provider
            {...props}
            value={{ theme, setTheme, resolvedTheme }}
        >
            {children}
        </ThemeProviderContext.Provider>
    );
}
