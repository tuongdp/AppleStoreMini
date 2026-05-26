import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { addressSchema } from "@/lib/validations";
import { selectCurrentUser, selectIsAuthenticated } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export default function AddressStep({ defaultData, onNext }) {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: defaultData?.fullName || user?.fullName || "",
            phone: defaultData?.phone || user?.phone || "",
            address: defaultData?.address || "",
            email: defaultData?.email || user?.email || "",
            note: defaultData?.note || "",
        },
    });

    const handleNext = () => {
        form.handleSubmit((values) => {
            onNext(values);
        })();
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="mb-5 text-base font-semibold text-foreground">
                {"Thông tin giao hàng"}
            </h2>

            <Form {...form}>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {"Họ và tên"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={"Nguyễn Văn A"}
                                            {...field}
                                        />
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
                                    <FormLabel>
                                        {"Số điện thoại"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder={"0901234567"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {"Email"}
                                    {!isAuthenticated && <span className="ml-1 text-xs text-muted-foreground">(để nhận thông báo đơn hàng)</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder={"email@example.com"}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {"Địa chỉ"}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={"Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"}
                                        rows={3}
                                        {...field}
                                    />
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
                                <FormLabel>
                                    {"Ghi chú"}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={"Ghi chú thêm (tuỳ chọn)"}
                                        rows={2}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <div className="mt-6 flex justify-end">
                <Button
                    onClick={handleNext}
                    className="rounded-full px-8"
                >
                    {"Tiếp tục"}
                </Button>
            </div>
        </div>
    );
}
