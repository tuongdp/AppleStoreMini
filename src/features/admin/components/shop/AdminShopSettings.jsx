import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/api/shopSettingsApi";
import { cacheSellerInfo } from "@/utils/invoiceUtils";

const DEFAULTS = {
    shop: { name: "AppleStore Mini", logo: "", taxCode: "", address: "", phone: "", email: "", facebook: "", zalo: "", tiktok: "", youtube: "" },
    shipping: { defaultFee: 30000, freeShippingMinOrder: 5000000 },
    returnPolicy: { windowDays: 7 },
    reviewReward: { points: 20000, type: "FIXED" },
    payment: { codEnabled: true, vnpayEnabled: true },
    seo: { title: "", description: "" },
};

function Section({ title, description, children }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}

export default function AdminShopSettings() {
    const { data, isLoading } = useGetSettingsQuery();
    const [update, { isLoading: isSaving }] = useUpdateSettingsMutation();

    const [shop, setShop] = useState(DEFAULTS.shop);
    const [shipping, setShipping] = useState(DEFAULTS.shipping);
    const [returnPolicy, setReturnPolicy] = useState(DEFAULTS.returnPolicy);
    const [reviewReward, setReviewReward] = useState(DEFAULTS.reviewReward);
    const [payment, setPayment] = useState(DEFAULTS.payment);
    const [seo, setSeo] = useState(DEFAULTS.seo);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (data && !initialized) {
            const merged = { ...DEFAULTS, ...data };
            setShop({ ...DEFAULTS.shop, ...data?.shop });
            setShipping(merged.shipping);
            setReturnPolicy(merged.returnPolicy);
            setReviewReward(merged.reviewReward);
            setPayment(merged.payment);
            setSeo({ ...DEFAULTS.seo, ...data?.seo });
            setInitialized(true);
        }
    }, [data, initialized]);

    useEffect(() => {
        if (data?.shop) cacheSellerInfo(data.shop);
    }, [data]);

    const handleSave = async () => {
        try {
            const body = { shop, shipping, returnPolicy, reviewReward, payment, seo };
            await update(body).unwrap();
            cacheSellerInfo(shop);
            toast.success("Đã lưu cài đặt");
        } catch {
            toast.error("Không thể lưu, vui lòng thử lại");
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
            </div>
        );
    }

    const SaveButton = ({ size }) => (
        <Button onClick={handleSave} disabled={isSaving} size={size} className="rounded-full">
            {isSaving ? "Đang lưu..." : "Lưu tất cả"}
        </Button>
    );

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Cài đặt</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Cấu hình cửa hàng, vận chuyển, thanh toán và đánh giá.</p>
                </div>
            </div>

            <Section title="Thông tin cửa hàng" description="Hiển thị trên hóa đơn và footer website.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="s-name">Tên cửa hàng</Label>
                        <Input id="s-name" value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-logo">Logo (URL)</Label>
                        <Input id="s-logo" value={shop.logo} onChange={(e) => setShop({ ...shop, logo: e.target.value })} placeholder="https://..." />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="s-taxCode">Mã số thuế</Label>
                        <Input id="s-taxCode" value={shop.taxCode} onChange={(e) => setShop({ ...shop, taxCode: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-phone">Số điện thoại</Label>
                        <Input id="s-phone" value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="s-address">Địa chỉ</Label>
                    <Input id="s-address" value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="s-email">Email</Label>
                    <Input id="s-email" type="email" value={shop.email} onChange={(e) => setShop({ ...shop, email: e.target.value })} />
                </div>
            </Section>

            <Section title="Mạng xã hội" description="Link hiển thị ở footer website.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="s-fb">Facebook</Label>
                        <Input id="s-fb" value={shop.facebook} onChange={(e) => setShop({ ...shop, facebook: e.target.value })} placeholder="https://facebook.com/..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-zalo">Zalo</Label>
                        <Input id="s-zalo" value={shop.zalo} onChange={(e) => setShop({ ...shop, zalo: e.target.value })} placeholder="https://zalo.me/..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-tiktok">TikTok</Label>
                        <Input id="s-tiktok" value={shop.tiktok} onChange={(e) => setShop({ ...shop, tiktok: e.target.value })} placeholder="https://tiktok.com/..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-yt">YouTube</Label>
                        <Input id="s-yt" value={shop.youtube} onChange={(e) => setShop({ ...shop, youtube: e.target.value })} placeholder="https://youtube.com/..." />
                    </div>
                </div>
            </Section>

            <Section title="Thanh toán" description="Bật/tắt phương thức thanh toán.">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="s-cod" className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</Label>
                        <p className="text-xs text-muted-foreground">Khách trả tiền mặt khi nhận hàng.</p>
                    </div>
                    <Switch id="s-cod" checked={payment.codEnabled} onCheckedChange={(v) => setPayment({ ...payment, codEnabled: v })} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="s-vnpay" className="text-sm font-medium">VNPay</Label>
                        <p className="text-xs text-muted-foreground">Thanh toán online qua cổng VNPay.</p>
                    </div>
                    <Switch id="s-vnpay" checked={payment.vnpayEnabled} onCheckedChange={(v) => setPayment({ ...payment, vnpayEnabled: v })} />
                </div>
            </Section>

            <Section title="Vận chuyển" description="Cấu hình phí giao hàng mặc định.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="s-ship-fee">Phí giao hàng mặc định (VNĐ)</Label>
                        <Input id="s-ship-fee" type="number" min="0" value={shipping.defaultFee} onChange={(e) => setShipping({ ...shipping, defaultFee: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-free-ship">Đơn tối thiểu miễn phí ship (VNĐ)</Label>
                        <Input id="s-free-ship" type="number" min="0" value={shipping.freeShippingMinOrder} onChange={(e) => setShipping({ ...shipping, freeShippingMinOrder: Number(e.target.value) || 0 })} />
                    </div>
                </div>
            </Section>

            <Section title="Đổi trả" description="Số ngày khách được yêu cầu đổi/trả hàng.">
                <div className="w-40 space-y-2">
                    <Label htmlFor="s-return-days">Số ngày đổi trả</Label>
                    <Input id="s-return-days" type="number" min="1" max="30" value={returnPolicy.windowDays} onChange={(e) => setReturnPolicy({ ...returnPolicy, windowDays: Number(e.target.value) || 7 })} />
                </div>
            </Section>

            <Section title="Điểm thưởng đánh giá" description="Thưởng điểm cho khách khi viết đánh giá sản phẩm.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="s-rw-points">Số điểm thưởng</Label>
                        <Input id="s-rw-points" type="number" min="0" value={reviewReward.points} onChange={(e) => setReviewReward({ ...reviewReward, points: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="s-rw-type">Loại thưởng</Label>
                        <Select value={reviewReward.type} onValueChange={(v) => setReviewReward({ ...reviewReward, type: v })}>
                            <SelectTrigger id="s-rw-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIXED">Cố định (VNĐ)</SelectItem>
                                <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Section>

            <Section title="SEO" description="Tiêu đề và mô tả mặc định cho toàn website.">
                <div className="space-y-2">
                    <Label htmlFor="s-seo-title">Meta title</Label>
                    <Input id="s-seo-title" value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} placeholder="AppleStore Mini - ..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="s-seo-desc">Meta description</Label>
                    <Textarea id="s-seo-desc" value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} placeholder="Mô tả website..." rows={3} />
                </div>
            </Section>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="lg" className="rounded-full">
                    {isSaving ? "Đang lưu..." : "Lưu tất cả"}
                </Button>
            </div>
        </div>
    );
}
