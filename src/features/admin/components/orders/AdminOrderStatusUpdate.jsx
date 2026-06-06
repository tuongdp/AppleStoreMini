import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useUpdateOrderStatusMutation } from "@/store/api/ordersApi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ORDER_STATUS } from "@/lib/constants";

const STATUS_MAP = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã huỷ",
    refunding: "Đang hoàn tiền",
    refunded: "Đã hoàn tiền",
};
const STATUS_OPTIONS = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.REFUNDING,
    ORDER_STATUS.REFUNDED,
];

const normalizeStatus = (status) => (status || "").toLowerCase();

export default function AdminOrderStatusUpdate({ orderId, currentStatus }) {
    const normalizedCurrentStatus = normalizeStatus(currentStatus);
    const [selected, setSelected] = useState(normalizedCurrentStatus);
    const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

    useEffect(() => {
        setSelected(normalizeStatus(currentStatus));
    }, [currentStatus]);

    const handleUpdate = async () => {
        if (selected === normalizedCurrentStatus || !orderId) return;

        try {
            await updateStatus({ id: orderId, status: selected }).unwrap();
            toast.success("Cập nhật trạng thái thành công");
        } catch {
            toast.error("Cập nhật trạng thái thất bại");
            setSelected(normalizedCurrentStatus);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-44 rounded-full" aria-label="Trạng thái đơn hàng">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                            {(STATUS_MAP[status] || status)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                size="sm"
                className="rounded-full"
                onClick={handleUpdate}
                disabled={isLoading || selected === normalizedCurrentStatus || !orderId}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                        {"Đang tải..."}
                    </>
                ) : (
                    "Cập nhật trạng thái"
                )}
            </Button>
        </div>
    );
}
