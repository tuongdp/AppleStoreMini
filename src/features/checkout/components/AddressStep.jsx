import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { addressSchema } from "@/lib/validations";
import { selectCurrentUser, selectIsAuthenticated } from "@/store/authSlice";
import { useGetWardsByProvinceQuery } from "@/store/api/addressApi";
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
import SearchableSelect from "@/components/ui/searchable-select";
import provinces from "@/data/province.json";

const provinceOptions = Object.values(provinces).map((p) => ({
    code: p.code,
    label: p.name_with_type,
}));

export default function AddressStep({ defaultData, onNext }) {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: defaultData?.fullName || user?.fullName || "",
            phone: defaultData?.phone || user?.phone || "",
            province: defaultData?.province || "",
            ward: defaultData?.ward || "",
            streetAddress: defaultData?.streetAddress || "",
            email: defaultData?.email || user?.email || "",
            note: defaultData?.note || "",
        },
    });

    const selectedProvince = form.watch("province");
    const { data: wards = [] } = useGetWardsByProvinceQuery(
        selectedProvince,
        { skip: !selectedProvince },
    );

    const wardOptions = wards.map((w) => ({ code: w.code, label: w.name_with_type }));

    const handleNext = () => {
        form.handleSubmit((values) => {
            const provinceName = provinceOptions.find((p) => p.code === values.province)?.label || "";
            const wardName = wardOptions.find((w) => w.code === values.ward)?.label || "";
            const address = `${values.streetAddress}, ${wardName}, ${provinceName}`;
            onNext({
                ...values,
                address,
            });
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
                                        {"Họ và tên"}<span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={"Nguyễn Văn A"}
                                            data-testid="checkout-full-name"
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
                                        {"Số điện thoại"}<span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder={"0901234567"}
                                            data-testid="checkout-phone"
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
                                        data-testid="checkout-email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Tỉnh/Thành phố"}<span className="text-destructive">*</span></FormLabel>
                                <SearchableSelect
                                    options={provinceOptions}
                                    value={field.value}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        form.setValue("ward", "");
                                    }}
                                    placeholder="Chọn tỉnh/thành phố"
                                    data-testid="checkout-province"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ward"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Xã/Phường"}<span className="text-destructive">*</span></FormLabel>
                                <SearchableSelect
                                    options={wardOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={selectedProvince ? "Chọn xã/phường" : "Vui lòng chọn tỉnh/thành phố trước"}
                                    disabled={!selectedProvince}
                                    emptyText="Không có dữ liệu"
                                    data-testid="checkout-ward"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Số nhà, tên đường"}<span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={"123 Nguyễn Huệ"}
                                        data-testid="checkout-street-address"
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
                                        data-testid="checkout-note"
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
                    data-testid="checkout-address-next"
                >
                    {"Tiếp tục"}
                </Button>
            </div>
        </div>
    );
}
