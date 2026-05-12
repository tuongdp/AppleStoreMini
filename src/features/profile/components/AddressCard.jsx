import { Pencil, Trash2, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useState } from "react";
import { cn, formatPhone } from "@/lib/utils";

export default function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isDeleting,
    isSettingDefault,
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <>
            <div
                className={cn(
                    "relative rounded-xl border p-4 transition-colors",
                    address.isDefault
                        ? "border-foreground/30 bg-muted/30"
                        : "border-border bg-card",
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    {/* Left — info */}
                    <div className="flex min-w-0 gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            {/* Name + phone */}
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                    {address.fullName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatPhone(address.phone)}
                                </span>
                                {address.isDefault && (
                                    <Badge
                                        variant="outline"
                                        className="border-foreground/30 text-xs"
                                    >
                                        <Star className="mr-1 h-2.5 w-2.5 fill-foreground" />
                                        {"Mặc định"}
                                    </Badge>
                                )}
                            </div>

                            {/* Full address */}
                            <p className="text-sm text-muted-foreground">
                                {address.address}, {address.ward},{" "}
                                {address.district}, {address.province}
                            </p>
                        </div>
                    </div>

                    {/* Right — actions */}
                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={onEdit}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setConfirmOpen(true)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Set default button */}
                {!address.isDefault && (
                    <div className="mt-3 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-full text-xs text-muted-foreground hover:text-foreground"
                            onClick={onSetDefault}
                            disabled={isSettingDefault}
                        >
                            {"Đặt làm mặc định"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Confirm delete dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={"Bạn có chắc muốn xoá địa chỉ này không?"}
                description={"Hành động này không thể hoàn tác."}
                onConfirm={onDelete}
                isLoading={isDeleting}
            />
        </>
    );
}
