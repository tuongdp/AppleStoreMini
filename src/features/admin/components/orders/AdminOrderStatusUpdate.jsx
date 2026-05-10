import { useEffect, useState } from "react";
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
  "empty": "Không có dữ liệu",
  "error": "Có lỗi xảy ra",
  "loading": "Đang tải...",
  "notFound": "Không tìm thấy",
  "success": "Thành công"
};
const STATUS_OPTIONS = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDING,
    ORDER_STATUS.REFUNDED,
];

export default function AdminOrderStatusUpdate({ orderId, currentStatus }) {
    const [selected, setSelected] = useState((currentStatus || "").toLowerCase());
    const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

    useEffect(() => {
        setSelected((currentStatus || "").toLowerCase());
    }, [currentStatus]);

    const handleUpdate = async () => {
        if (selected === currentStatus) return;

        try {
            await updateStatus({ id: orderId, status: selected }).unwrap();
            toast.success("Cập nhật trạng thái thành công");
        } catch {
            toast.error("Cập nhật trạng thái thất bại");
            setSelected(currentStatus);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-44 rounded-full">
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
                disabled={isLoading || selected === currentStatus}
            >
                {isLoading ? "Đang tải..." : "Cập nhật trạng thái"}
            </Button>
        </div>
    );
}
