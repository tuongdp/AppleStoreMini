import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportVATInvoicePDF, cacheSellerInfo, getSellerInfo } from "@/utils/invoiceUtils";
import { useGetSettingsQuery } from "@/store/api/shopSettingsApi";
import { toast } from "sonner";

const VAT_RATE_OPTIONS = [
  { value: "10", label: "10%" },
  { value: "8", label: "8%" },
];

export default function VATInvoiceDialog({ open, onClose, order }) {
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [address, setAddress] = useState("");
  const [vatRate, setVatRate] = useState("10");
  const [customRate, setCustomRate] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: settingsData } = useGetSettingsQuery();

  useEffect(() => {
    if (settingsData?.shop) {
      cacheSellerInfo(settingsData.shop);
    }
  }, [settingsData]);

  const handleClose = () => {
    setCompanyName("");
    setTaxCode("");
    setAddress("");
    setVatRate("10");
    setCustomRate("");
    setIsCustom(false);
    setIsLoading(false);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Vui lòng nhập tên công ty";
    if (!taxCode.trim()) newErrors.taxCode = "Vui lòng nhập mã số thuế";
    if (isCustom) {
      const rate = Number(customRate);
      if (!customRate || isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.vatRate = "Thuế suất không hợp lệ";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExport = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const finalRate = isCustom ? Number(customRate) : Number(vatRate);
      await exportVATInvoicePDF({
        order,
        buyerInfo: {
          companyName: companyName.trim(),
          taxCode: taxCode.trim(),
          address: address.trim(),
        },
        vatRate: finalRate,
        sellerInfo: getSellerInfo(),
      });
      toast.success("Đã xuất hóa đơn GTGT");
      handleClose();
    } catch (err) {
      console.error("Export VAT invoice failed:", err);
      toast.error("Xuất hóa đơn thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất hóa đơn GTGT</DialogTitle>
          <DialogDescription>
            Nhập thông tin công ty người mua để xuất hóa đơn giá trị gia tăng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Tên công ty <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Nhập tên công ty"
              value={companyName}
              aria-required="true"
              aria-invalid={!!errors.companyName}
              aria-describedby={errors.companyName ? "companyName-error" : undefined}
              onChange={(e) => { setCompanyName(e.target.value); setErrors((p) => ({ ...p, companyName: undefined })); }}
            />
            {errors.companyName && (
              <p id="companyName-error" className="text-xs text-destructive" role="alert">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxCode">
              Mã số thuế <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxCode"
              placeholder="Nhập mã số thuế"
              value={taxCode}
              aria-required="true"
              aria-invalid={!!errors.taxCode}
              aria-describedby={errors.taxCode ? "taxCode-error" : undefined}
              onChange={(e) => { setTaxCode(e.target.value); setErrors((p) => ({ ...p, taxCode: undefined })); }}
            />
            {errors.taxCode && (
              <p id="taxCode-error" className="text-xs text-destructive" role="alert">{errors.taxCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              placeholder="Nhập địa chỉ công ty"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-rate-select">Thuế suất GTGT</Label>
            <div className="flex items-center gap-3">
              <Select
                value={isCustom ? "custom" : vatRate}
                onValueChange={(val) => {
                  if (val === "custom") {
                    setIsCustom(true);
                  } else {
                    setIsCustom(false);
                    setVatRate(val);
                    setErrors((p) => ({ ...p, vatRate: undefined }));
                  }
                }}
              >
                <SelectTrigger id="vat-rate-select" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VAT_RATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Khác</SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <div className="flex items-center gap-1">
                  <Input
                    className="w-20"
                    placeholder="0"
                    value={customRate}
                    aria-invalid={!!errors.vatRate}
                    aria-describedby={errors.vatRate ? "vatRate-error" : undefined}
                    onChange={(e) => { setCustomRate(e.target.value); setErrors((p) => ({ ...p, vatRate: undefined })); }}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
            </div>
            {errors.vatRate && (
              <p id="vatRate-error" className="text-xs text-destructive" role="alert">{errors.vatRate}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Đang xuất..." : "Xuất hóa đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
