import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
    useCreateCouponMutation,
    useUpdateCouponMutation,
} from "@/store/api/couponsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPriceInput, parsePriceInput } from "@/lib/utils";

function PriceInput({ value, onChange, ...props }) {
    const [focused, setFocused] = useState(false);
    const display = focused ? (value || "") : formatPriceInput(value);

    return (
        <Input
            {...props}
            value={display}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
                const raw = parsePriceInput(e.target.value);
                onChange?.(raw);
            }}
        />
    );
}

const couponSchema = z.object({
    code: z
        .string()
        .min(3, "Mã tối thiểu 3 ký tự")
        .max(20, "Mã tối đa 20 ký tự")
        .toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.number().min(1, "Giá trị phải lớn hơn 0"),
    maxDiscountAmount: z.number().optional(),
    minOrderAmount: z.number().optional(),
    maxUsage: z.number().optional(),
    expiresAt: z.string().optional(),
});

const emptyToNumber = (value) => (value === "" ? undefined : Number(value));

const buildDefaultValues = (coupon) => {
    if (!coupon) {
        return {
            code: "",
            description: "",
            discountType: "percent",
            discountValue: 10,
            maxDiscountAmount: undefined,
            minOrderAmount: undefined,
            maxUsage: undefined,
            expiresAt: "",
        };
    }

    return {
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: String(coupon.discountType || "percent").toLowerCase(),
        discountValue: coupon.discountValue || 10,
        maxDiscountAmount: coupon.maxDiscountAmount || undefined,
        minOrderAmount: coupon.minOrderAmount || undefined,
        maxUsage: coupon.maxUsage || undefined,
        expiresAt: coupon.expiresAt
            ? new Date(coupon.expiresAt).toISOString().split("T")[0]
            : "",
    };
};

export default function AdminCouponForm({ coupon, onClose }) {
    const isEditing = !!coupon;
    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
    const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: buildDefaultValues(coupon),
    });

    const watchDiscountType = form.watch("discountType");

    const onSubmit = async (values) => {
        const payload = {
            ...values,
            code: values.code.toUpperCase(),
            discountType: values.discountType,
            ...(values.maxDiscountAmount ? { maxDiscountAmount: Number(values.maxDiscountAmount) } : {}),
            ...(values.minOrderAmount ? { minOrderAmount: Number(values.minOrderAmount) } : {}),
            ...(values.maxUsage ? { maxUsage: Number(values.maxUsage) } : {}),
            expiresAt: values.expiresAt || null,
        };

        try {
            if (isEditing) {
                await updateCoupon({
                    id: coupon._id || coupon.id,
                    ...payload,
                }).unwrap();
                toast.success("Đã cập nhật mã giảm giá");
            } else {
                await createCoupon(payload).unwrap();
                toast.success("Đã tạo mã giảm giá mới");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã giảm giá</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: SUMMER20"
                                        disabled={isLoading || isEditing}
                                        className="uppercase"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả (tùy chọn)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: Giảm 20% mùa hè"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loại giảm</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="percent">Phần trăm (%)</SelectItem>
                                        <SelectItem value="fixed">Số tiền cố định (₫)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Giá trị giảm {watchDiscountType === "percent" ? "(%)" : "(₫)"}
                                </FormLabel>
                                <FormControl>
                                    {watchDiscountType === "percent" ? (
                                        <Input
                                            type="number"
                                            min={1}
                                            max={100}
                                            placeholder="20"
                                            disabled={isLoading}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    ) : (
                                        <PriceInput
                                            placeholder="50.000"
                                            disabled={isLoading}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {watchDiscountType === "percent" && (
                            <FormField
                                control={form.control}
                                name="maxDiscountAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Giảm tối đa (₫){" "}
                                            <span className="text-muted-foreground">(tùy chọn)</span>
                                        </FormLabel>
                                        <FormControl>
                                            <PriceInput
                                                placeholder="200.000"
                                                disabled={isLoading}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                    )}

                    <FormField
                        control={form.control}
                        name="minOrderAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Đơn tối thiểu (₫){" "}
                                    <span className="text-muted-foreground">(tùy chọn)</span>
                                </FormLabel>
                                <FormControl>
                                    <PriceInput
                                        placeholder="1.000.000"
                                        disabled={isLoading}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maxUsage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Số lượt dùng{" "}
                                    <span className="text-muted-foreground">
                                        (để trống = không giới hạn)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="VD: 100"
                                        disabled={isLoading}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(emptyToNumber(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="expiresAt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Ngày hết hạn{" "}
                                    <span className="text-muted-foreground">
                                        (để trống = không hết hạn)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        disabled={isLoading}
                                        min={new Date().toISOString().split("T")[0]}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mã"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
