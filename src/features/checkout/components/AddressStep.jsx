import { useState, useMemo } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Search } from "lucide-react";
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

    const [wardSearch, setWardSearch] = useState("");
    const filteredWards = useMemo(() => {
        if (!wardSearch.trim()) return wards;
        const q = wardSearch.toLowerCase();
        return wards.filter((w) => w.name_with_type.toLowerCase().includes(q));
    }, [wards, wardSearch]);

    const handleNext = () => {
        form.handleSubmit((values) => {
            const provinceName = provinceOptions.find((p) => p.code === values.province)?.label || "";
            const wardName = wards.find((w) => w.code === values.ward)?.name_with_type || "";
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
                                        {"Họ và tên"}
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
                                        {"Số điện thoại"}
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
                                <FormLabel>{"Tỉnh/Thành phố"}</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue("ward", "");
                                        setWardSearch("");
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger data-testid="checkout-province">
                                            <SelectValue placeholder={"Chọn tỉnh/thành phố"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {provinceOptions.map((p) => (
                                            <SelectItem key={p.code} value={p.code}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ward"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Xã/Phường"}</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setWardSearch("");
                                    }}
                                    disabled={!selectedProvince}
                                >
                                    <FormControl>
                                        <SelectTrigger data-testid="checkout-ward">
                                            <SelectValue placeholder={
                                                selectedProvince
                                                    ? "Chọn xã/phường"
                                                    : "Vui lòng chọn tỉnh/thành phố trước"
                                            } />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <div
                                            className="sticky top-0 z-10 flex items-center gap-2 border-b bg-popover px-3 py-2"
                                            onKeyDown={(e) => e.stopPropagation()}
                                        >
                                            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <input
                                                className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                                placeholder="Tìm kiếm..."
                                                value={wardSearch}
                                                onChange={(e) => setWardSearch(e.target.value)}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {filteredWards.length === 0 ? (
                                            <p className="px-3 py-2 text-sm text-muted-foreground">
                                                {wardSearch ? "Không tìm thấy" : "Không có dữ liệu"}
                                            </p>
                                        ) : (
                                            filteredWards.map((w) => (
                                                <SelectItem key={w.code} value={w.code}>
                                                    {w.name_with_type}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Số nhà, tên đường"}</FormLabel>
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
