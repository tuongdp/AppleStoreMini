import { AlertTriangle } from "lucide-react";

export default function GuestCartWarning() {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
            />
            <p className="text-xs leading-snug">
                Bạn chưa đăng nhập. Giỏ hàng sẽ bị xóa khi đóng trình duyệt.
                {" "}
                <strong className="font-semibold">Đăng nhập</strong>
                {" "}để lưu giỏ hàng an toàn.
            </p>
        </div>
    );
}
