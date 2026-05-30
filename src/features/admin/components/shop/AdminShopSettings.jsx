import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useGetShopSettingsQuery, useUpdateShopSettingsMutation } from "@/store/api/shopSettingsApi";

const DEFAULTS = {
    name: "AppleStore Mini",
    taxCode: "",
    address: "",
    phone: "",
    email: "",
};

export default function AdminShopSettings() {
    const { data, isLoading } = useGetShopSettingsQuery();
    const [update, { isLoading: isSaving }] = useUpdateShopSettingsMutation();

    const [fields, setFields] = useState(DEFAULTS);
    const [savedFields, setSavedFields] = useState(DEFAULTS);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (data) {
            const merged = { ...DEFAULTS, ...data };
            setFields(merged);
            setSavedFields(merged);
        }
    }, [data]);

    const isDirty = JSON.stringify(fields) !== JSON.stringify(savedFields);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const handleChange = (key) => (e) => {
        setFields((prev) => ({ ...prev, [key]: e.target.value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSave = async () => {
        const newErrors = {};
        if (!fields.name.trim()) newErrors.name = "Tên cửa hàng không được để trống";
        if (!fields.taxCode.trim()) newErrors.taxCode = "Mã số thuế không được để trống";
        if (!fields.address.trim()) newErrors.address = "Địa chỉ không được để trống";
        if (!fields.phone.trim()) newErrors.phone = "Số điện thoại không được để trống";
        if (!fields.email.trim()) newErrors.email = "Email không được để trống";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            await update(fields).unwrap();
            setSavedFields(fields);
            toast.success("Đã lưu thông tin cửa hàng");
        } catch {
            toast.error("Không thể lưu, vui lòng thử lại");
        }
    };

    const handleReset = () => {
        setFields(savedFields);
        setErrors({});
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl space-y-6">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-12 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle>Thông tin cửa hàng</CardTitle>
                        {isDirty && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                Có thay đổi chưa lưu
                            </span>
                        )}
                    </div>
                    <CardDescription>
                        Cấu hình thông tin người bán hiển thị trên hóa đơn GTGT.
                        Dữ liệu được lưu trên máy chủ.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="shop-name">Tên cửa hàng</Label>
                        <Input
                            id="shop-name"
                            value={fields.name}
                            onChange={handleChange("name")}
                            placeholder="Nhập tên cửa hàng"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="shop-taxCode">Mã số thuế</Label>
                            <Input
                                id="shop-taxCode"
                                value={fields.taxCode}
                                onChange={handleChange("taxCode")}
                                placeholder="Mã số thuế"
                            />
                            {errors.taxCode && <p className="text-xs text-destructive">{errors.taxCode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shop-phone">Số điện thoại</Label>
                            <Input
                                id="shop-phone"
                                value={fields.phone}
                                onChange={handleChange("phone")}
                                placeholder="Số điện thoại"
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shop-address">Địa chỉ</Label>
                        <Input
                            id="shop-address"
                            value={fields.address}
                            onChange={handleChange("address")}
                            placeholder="Nhập địa chỉ cửa hàng"
                        />
                        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shop-email">Email</Label>
                        <Input
                            id="shop-email"
                            type="email"
                            value={fields.email}
                            onChange={handleChange("email")}
                            placeholder="Email cửa hàng"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                    {isSaving ? "Đang lưu..." : "Lưu thông tin"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={!isDirty}>
                    Hoàn tác
                </Button>
            </div>
        </div>
    );
}
