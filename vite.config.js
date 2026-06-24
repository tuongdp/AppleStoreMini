import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
    plugins: [react()],
    define: {
        "process.env": JSON.stringify({}),
        global: "globalThis",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/react-router")) {
                        return "vendor";
                    }
                    if (id.includes("node_modules/@reduxjs") || id.includes("node_modules/react-redux") || id.includes("node_modules/redux-persist")) {
                        return "redux";
                    }
                    if (id.includes("node_modules/swiper")) {
                        return "swiper";
                    }
                    if (id.includes("node_modules/@tiptap")) {
                        return "tiptap";
                    }
                    if (id.includes("node_modules/xlsx")) {
                        return "xlsx";
                    }
                    if (id.includes("node_modules/jspdf") || id.includes("node_modules/html2canvas")) {
                        return "pdf";
                    }
                    if (id.includes("node_modules/recharts")) {
                        return "charts";
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
}));
