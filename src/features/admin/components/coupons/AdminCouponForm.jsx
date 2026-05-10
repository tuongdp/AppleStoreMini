import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    pointsCost: z.number().optional(),
    expiresAt: z.string().optional(),
});

export default function AdminCouponForm({ coupon, onClose }) {
    const isEditing = !!coupon;
    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
    const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            description: "",
            discountType: "percent",
            discountValue: 10,
            maxDiscountAmount: undefined,
            minOrderAmount: undefined,
            maxUsage: undefined,
            pointsCost: undefined,
            expiresAt: "",
        },
    });

    const watchDiscountType = form.watch("discountType");

    useEffect(() => {
        if (coupon) {
            form.reset({
                code: coupon.code || "",
                description: coupon.description || "",
                discountType: coupon.discountType || "percent",
                discountValue: coupon.discountValue || 10,
                maxDiscountAmount: coupon.maxDiscountAmount || undefined,
                minOrderAmount: coupon.minOrderAmount || undefined,
                maxUsage: coupon.maxUsage || undefined,
                pointsCost: coupon.pointsCost || undefined,
                expiresAt: coupon.expiresAt
                    ? new Date(coupon.expiresAt).toISOString().split("T")[0]
                    : "",
            });
        }
    }, [coupon, form]);

    const onSubmit = async (values) => {
        // Clean empty optional fields
        const payload = {
            ...values,
            maxDiscountAmount: values.maxDiscountAmount || undefined,
            minOrderAmount: values.minOrderAmount || undefined,
            maxUsage: values.maxUsage || undefined,
            pointsCost: values.pointsCost || undefined,
            expiresAt: values.expiresAt || undefined,
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
                    {/* Code */}
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
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description */}
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
                    {/* Discount type */}
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
                                        <SelectItem value="percent">
                                            Phần trăm (%)
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            Số tiền cố định (₫)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Discount value */}
                    <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Giá trị giảm{" "}
                                    {watchDiscountType === "percent"
                                        ? "(%)"
                                        : "(₫)"}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={
                                            watchDiscountType === "percent"
                                                ? 100
                                                : undefined
                                        }
                                        placeholder={
                                            watchDiscountType === "percent"
                                                ? "20"
                                                : "50000"
                                        }
                                        disabled={isLoading}
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Max discount — chỉ hiện khi type = percent */}
                    {watchDiscountType === "percent" && (
                        <FormField
                            control={form.control}
                            name="maxDiscountAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Giảm tối đa (₫){" "}
                                        <span className="text-muted-foreground">
                                            (tùy chọn)
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="VD: 200000"
                                            disabled={isLoading}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? undefined
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Min order amount */}
                    <FormField
                        control={form.control}
                        name="minOrderAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Đơn tối thiểu (₫){" "}
                                    <span className="text-muted-foreground">
                                        (tùy chọn)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="VD: 1000000"
                                        disabled={isLoading}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Max usage */}
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
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Points cost */}
                    <FormField
                        control={form.control}
                        name="pointsCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Điểm quy đổi{" "}
                                    <span className="text-muted-foreground">
                                        (để 0 hoặc trống = không đổi bằng điểm)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="VD: 500"
                                        disabled={isLoading}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Expires at */}
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
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
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
                        {isLoading
                            ? "Đang lưu..."
                            : isEditing
                              ? "Cập nhật"
                              : "Tạo mã"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
