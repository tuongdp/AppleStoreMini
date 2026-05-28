import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind ───────────────────────────────────────────
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const LOCALE = "vi-VN";
const CURRENCY = "VND";

// ── Format giá tiền ────────────────────────────────────
export function formatPrice(price) {
    if (!price && price !== 0) return "";
    return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: CURRENCY,
        maximumFractionDigits: 0,
    }).format(price);
}

// Format input khi đang gõ (chỉ thêm dấu phân cách, không ký hiệu tiền)
export function formatPriceInput(value) {
    if (value === "" || value === undefined || value === null) return "";
    const num = typeof value === "string" ? Number(value.replace(/\D/g, "")) : Number(value);
    if (!num && num !== 0) return "";
    return new Intl.NumberFormat(LOCALE).format(num);
}

// Parse input đã format về number
export function parsePriceInput(value) {
    if (typeof value === "number") return value;
    if (!value) return 0;
    return Number(value.replace(/[^\d]/g, "")) || 0;
}
export function calcDiscount(price, salePrice) {
    if (!salePrice || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
}

// ── Format ngày tháng ──────────────────────────────────
export function formatDate(date, options = {}) {
    if (!date) return "";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...options,
    }).format(new Date(date));
}

export function formatDateTime(date) {
    if (!date) return "";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

// Tính thời gian tương đối — "2 giờ trước", "3 ngày trước"
export function timeAgo(date) {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
        { label: "năm", seconds: 31536000 },
        { label: "tháng", seconds: 2592000 },
        { label: "tuần", seconds: 604800 },
        { label: "ngày", seconds: 86400 },
        { label: "giờ", seconds: 3600 },
        { label: "phút", seconds: 60 },
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label} trước`;
    }
    return "Vừa xong";
}

// ── String ─────────────────────────────────────────────
export function sanitizeText(text) {
    if (!text) return "";
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function slugify(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function truncate(text, maxLength = 100) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
}

export function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ── Number ─────────────────────────────────────────────
export function formatNumber(number) {
    if (!number && number !== 0) return "";
    return new Intl.NumberFormat(LOCALE).format(number);
}

// ── Storage / localStorage ─────────────────────────────
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* noop */ }
}

export function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch { /* noop */ }
}

// ── Validation helpers ─────────────────────────────────
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
    return /^0[35789][0-9]{8}$/.test(phone);
}

export function formatPhone(phone) {
    if (!phone) return "";
    const cleaned = String(phone).replace(/\D/g, "");
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

// ── Array ──────────────────────────────────────────────
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {});
}

// ── URL / Params ───────────────────────────────────────
export function buildQueryString(params) {
    const query = Object.entries(params)
        .filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== "",
        )
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&");
    return query ? `?${query}` : "";
}

// ── File ───────────────────────────────────────────────
export function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function isValidImageFile(file) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    return validTypes.includes(file.type);
}

export const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "object") return field;
    if (typeof field === "string" && (field.startsWith("[") || field.startsWith("{"))) {
        try {
            return JSON.parse(field);
        } catch {
            return [];
        }
    }
    return [field];
};

// ── Image upload ──────────────────────────────────────
export async function uploadBlobImages(urls, uploadFn) {
    let counter = 0;
    return Promise.all(
        urls.map(async (url) => {
            if (typeof url !== "string" || !url.startsWith("blob:")) return url;
            const res = await fetch(url);
            const blob = await res.blob();
            const ext = blob.type.split("/")[1] || "jpg";
            const file = new File([blob], `image-${Date.now()}-${counter++}.${ext}`, { type: blob.type });
            const fd = new FormData();
            fd.append("image", file);
            const result = await uploadFn(fd);
            return result.url || result;
        })
    );
}
