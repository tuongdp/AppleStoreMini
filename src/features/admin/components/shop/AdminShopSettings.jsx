import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const STORAGE_KEY = "shop_settings";

const DEFAULTS = {
  name: "AppleStore Mini",
  taxCode: "",
  address: "",
  phone: "",
  email: "",
};

export default function AdminShopSettings() {
  const [fields, setFields] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULTS };
  });

  const [errors, setErrors] = useState({});

  const handleChange = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = () => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    toast.success("Đã lưu thông tin cửa hàng");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cửa hàng</CardTitle>
          <CardDescription>
            Cấu hình thông tin người bán hiển thị trên hóa đơn GTGT.
            Dữ liệu được lưu trên trình duyệt.
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

      <Button onClick={handleSave}>Lưu thông tin</Button>
    </div>
  );
}
