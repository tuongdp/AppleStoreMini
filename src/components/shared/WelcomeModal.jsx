import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "app-welcome-dismissed";

export function isWelcomeDismissed() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

export default function WelcomeModal({ open, onClose }) {
    const [understood, setUnderstood] = useState(false);

    const handleClose = () => {
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        onClose();
    };

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
                role="button"
                aria-label="Đóng thông báo"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClose(); }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
                <h2 className="text-lg font-semibold text-foreground">
                    Thông báo
                </h2>

                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Website này được xây dựng nhằm mục đích <strong className="text-foreground">học tập</strong> và phục vụ <strong className="text-foreground">đồ án tốt nghiệp cá nhân</strong>.
                    </p>
                    <p>
                        Một số hình ảnh và nội dung sản phẩm được tham khảo từ{" "}
                        <strong className="text-foreground">TopZone</strong> nhằm
                        minh họa giao diện và chức năng của hệ thống thương mại
                        điện tử.
                    </p>
                    <p>
                        Tôi <strong className="text-foreground">không</strong>{" "}
                        sử dụng các nội dung này cho mục đích thương mại hay
                        nhận sở hữu đối với nội dung thuộc bên thứ ba.
                    </p>
                    <p>
                        Nếu có bất kỳ vấn đề liên quan đến nội dung hoặc bản
                        quyền, vui lòng liên hệ để được hỗ trợ chỉnh sửa hoặc
                        gỡ bỏ phù hợp.
                    </p>
                    <p className="text-foreground">Xin chân thành cảm ơn.</p>
                </div>

                <div className="mt-6 space-y-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <Checkbox
                            checked={understood}
                            onCheckedChange={setUnderstood}
                        />
                        <span className="select-none">Tôi đã hiểu</span>
                    </label>

                    <Button
                        className="w-full rounded-full"
                        disabled={!understood}
                        onClick={handleClose}
                    >
                        Xác nhận & đóng
                    </Button>
                </div>
            </div>
        </div>,
        document.getElementById("modal"),
    );
}
