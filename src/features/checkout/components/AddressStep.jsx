import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { addressSchema } from "@/lib/validations";
import { useGetAddressesQuery } from "@/store/api/usersApi";
import { selectIsAuthenticated } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import AddressSavedList from "./AddressSavedList";
import { cn } from "@/lib/utils";

export default function AddressStep({ defaultData, onNext }) {
    const { t } = useTranslation("checkout");
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data } = useGetAddressesQuery(undefined, {
        skip: !isAuthenticated,
    });

    // ✅ usersApi transformResponse → response.data trực tiếp (array)
    const addresses = data ?? [];

    const [selectedAddressId, setSelectedAddressId] = useState(
        defaultData?.addressId || null,
    );
    const [showNewForm, setShowNewForm] = useState(false);

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: defaultData?.address?.fullName || "",
            phone: defaultData?.address?.phone || "",
            province: defaultData?.address?.province || "",
            district: defaultData?.address?.district || "",
            ward: defaultData?.address?.ward || "",
            address: defaultData?.address?.address || "",
            isDefault: false,
        },
    });

    // ✅ Tự động chọn địa chỉ mặc định — dùng integer id
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr =
                addresses.find((a) => a.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddr.id);
        }
    }, [addresses, selectedAddressId]);

    useEffect(() => {
        if (!isAuthenticated || addresses.length === 0) {
            setShowNewForm(true);
        }
    }, [isAuthenticated, addresses]);

    const handleSelectAddress = (address) => {
        // ✅ MySQL integer id
        setSelectedAddressId(address.id);
        setShowNewForm(false);
    };

    const handleNext = () => {
        if (selectedAddressId && !showNewForm) {
            // ✅ So sánh bằng integer id
            const address = addresses.find((a) => a.id === selectedAddressId);
            onNext({ addressId: selectedAddressId, address });
            return;
        }
        form.handleSubmit((values) => {
            onNext({ addressId: null, address: values });
        })();
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="mb-5 text-base font-semibold text-foreground">
                {t("address.title")}
            </h2>

            {isAuthenticated && addresses.length > 0 && (
                <div className="mb-5 space-y-3">
                    <AddressSavedList
                        addresses={addresses}
                        selectedId={selectedAddressId}
                        onSelect={handleSelectAddress}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setShowNewForm((v) => !v);
                            if (!showNewForm) setSelectedAddressId(null);
                        }}
                        className={cn(
                            "flex w-full items-center gap-2 rounded-xl border border-dashed p-4 text-sm transition-colors",
                            showNewForm
                                ? "border-foreground text-foreground"
                                : "border-border text-muted-foreground hover:border-foreground/30",
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        {t("address.addNewAddress")}
                    </button>
                </div>
            )}

            {showNewForm && (
                <>
                    {addresses.length > 0 && <Separator className="mb-5" />}
                    <Form {...form}>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("address.fullName")}
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
                                                {t("address.phone")}
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="province"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("address.province")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        "address.provincePlaceholder",
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
                                    name="district"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("address.district")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        "address.districtPlaceholder",
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
                                    name="ward"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("address.ward")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        "address.wardPlaceholder",
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
                                            {t("address.address")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "address.addressPlaceholder",
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
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("address.note")}
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
                </>
            )}

            <div className="mt-6 flex justify-end gap-3">
                {showNewForm && addresses.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={() => setShowNewForm(false)}
                        className="rounded-full px-8"
                    >
                        {t("btn.cancel", { ns: "common" })}
                    </Button>
                )}
                <Button
                    onClick={handleNext}
                    className="rounded-full px-8"
                    disabled={!showNewForm && !selectedAddressId}
                >
                    {t("address.continue")}
                </Button>
            </div>
        </div>
    );
}
