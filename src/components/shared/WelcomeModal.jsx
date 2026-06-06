import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "app-welcome-dismissed";

export default function WelcomeModal({ open, onClose }) {
    const [understood, setUnderstood] = useState(false);

    const handleClose = () => {
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            // Ignore private browsing or storage permission failures.
        }
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
            <DialogContent className="max-h-[calc(100vh-2rem)] w-full overflow-y-auto p-6 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Thông báo</DialogTitle>
                    <DialogDescription className="sr-only">
                        Thông báo mục đích sử dụng website và nội dung tham khảo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Website này được xây dựng nhằm mục đích{" "}
                        <strong className="text-foreground">học tập</strong> và phục vụ{" "}
                        <strong className="text-foreground">đồ án tốt nghiệp cá nhân</strong>.
                    </p>
                    <p>
                        Một số hình ảnh và nội dung sản phẩm được tham khảo từ{" "}
                        <strong className="text-foreground">TopZone</strong> nhằm minh họa giao diện
                        và chức năng của hệ thống thương mại điện tử.
                    </p>
                    <p>
                        Tôi <strong className="text-foreground">không</strong> sử dụng các nội dung này
                        cho mục đích thương mại hay nhận sở hữu đối với nội dung thuộc bên thứ ba.
                    </p>
                    <p>
                        Nếu có bất kỳ vấn đề liên quan đến nội dung hoặc bản quyền, vui lòng liên hệ
                        để được hỗ trợ chỉnh sửa hoặc gỡ bỏ phù hợp.
                    </p>
                    <p className="text-foreground">Xin chân thành cảm ơn.</p>
                </div>

                <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-0">
                    <div className="w-full space-y-3">
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
