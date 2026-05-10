import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { addressSchema } from "@/lib/validations";
import { selectCurrentUser } from "@/store/authSlice";
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

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: defaultData?.fullName || user?.fullName || "",
            phone: defaultData?.phone || user?.phone || "",
            address: defaultData?.address || "",
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
                                            placeholder={t(
                                                "address.fullNamePlaceholder",
                                            )}
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
                                            placeholder={t(
                                                "address.phonePlaceholder",
                                            )}
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
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {"Địa chỉ"}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={t(
                                            "address.addressPlaceholder",
                                        )}
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
                                        placeholder={t(
                                            "address.notePlaceholder",
                                        )}
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
