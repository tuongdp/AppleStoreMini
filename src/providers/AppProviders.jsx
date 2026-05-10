import { ThemeProvider } from "./ThemeProvider";

export default function AppProviders({ children }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="apple-store-theme">
            {children}
        </ThemeProvider>
    );
}
