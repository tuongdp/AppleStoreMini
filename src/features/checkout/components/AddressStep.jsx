import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/authSlice";
import { useUpdateProfileMutation } from "@/store/api/usersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";

const addressSchema = z.object({
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    phone: z.string().regex(/^0[0-9]{9}$/, "Số điện thoại không hợp lệ"),
    address: z.string().min(10, "Địa chỉ tối thiểu 10 ký tự"),
    note: z.string().max(200).optional(),
    saveToProfile: z.boolean().optional(),
});

export default function AddressStep({ defaultData, onNext }) {
    const user = useSelector(selectCurrentUser);
    const [updateProfile] = useUpdateProfileMutation();

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: defaultData?.fullName || user?.fullName || "",
            phone: defaultData?.phone || user?.phone || "",
            address: defaultData?.address || user?.address || "",
            note: defaultData?.note || "",
            saveToProfile: false,
        },
    });

    const handleNext = form.handleSubmit(async (values) => {
        if (values.saveToProfile) {
            updateProfile({
                fullName: values.fullName,
                phone: values.phone,
                address: values.address,
            }).unwrap().catch(() => {});
        }
        onNext({
            fullName: values.fullName,
            phone: values.phone,
            address: values.address,
            email: user?.email || "",
            note: values.note || "",
        });
    });

    return (
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="mb-1 text-base font-semibold text-foreground">
                Thông tin giao hàng
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
                Mặc định lấy từ tài khoản, bạn có thể thay đổi nếu cần gửi đến địa chỉ khác.
            </p>

            <Form {...form}>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nguyễn Văn A" data-testid="checkout-full-name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="0901234567" data-testid="checkout-phone" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email nhận hóa đơn</label>
                        <Input type="email" disabled value={user?.email || ""} className="mt-2" />
                        <p className="mt-1 text-xs text-muted-foreground">Email từ tài khoản của bạn</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Địa chỉ <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Textarea placeholder="123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" rows={2} data-testid="checkout-address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ghi chú <span className="text-xs text-muted-foreground">(tuỳ chọn)</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Giao giờ hành chính..." data-testid="checkout-note" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="saveToProfile"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="!mt-0 cursor-pointer text-xs text-muted-foreground">
                                    Lưu thông tin này vào tài khoản
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} className="rounded-full px-8" data-testid="checkout-address-next">
                    Tiếp tục
                </Button>
            </div>
        </div>
    );
}
