import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    variant = "destructive", // destructive | default
    isLoading = false,
}) {
    const { t } = useTranslation();

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    const handleConfirm = async () => {
        await onConfirm?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{title || t("confirm.delete")}</DialogTitle>
                    <DialogDescription>
                        {description || t("confirm.deleteDesc")}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel || t("btn.cancel")}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? t("status.loading")
                            : confirmLabel || t("btn.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
