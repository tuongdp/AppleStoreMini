import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { addressSchema } from "@/lib/validations";
import {
  useAddAddressMutation,
  useUpdateAddressMutation,
} from "@/store/api/usersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export default function AddressForm({ address, onClose }) {
  const { t } = useTranslation("profile");
  const isEditing = !!address;

  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const isLoading = isAdding || isUpdating;

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      address: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (address) {
      form.reset({
        fullName: address.fullName || "",
        phone: address.phone || "",
        province: address.province || "",
        district: address.district || "",
        ward: address.ward || "",
        address: address.address || "",
        isDefault: address.isDefault || false,
      });
    }
  }, [address, form]);

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        // ✅ MySQL integer id thuần — không có _id
        await updateAddress({
          addressId: address.id,
          ...values,
        }).unwrap();
        toast.success(t("address.updateSuccess"));
      } else {
        await addAddress(values).unwrap();
        toast.success(t("address.addSuccess"));
      }
      onClose();
    } catch {
      toast.error(t("status.error", { ns: "common" }));
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-medium text-foreground">
          {isEditing ? t("address.edit") : t("address.addNew")}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address.fullName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.fullNamePlaceholder")}
                      disabled={isLoading}
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
                  <FormLabel>{t("address.phone")}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t("address.phonePlaceholder")}
                      disabled={isLoading}
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
                  <FormLabel>{t("address.province")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.provincePlaceholder")}
                      disabled={isLoading}
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
                  <FormLabel>{t("address.district")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.districtPlaceholder")}
                      disabled={isLoading}
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
                  <FormLabel>{t("address.ward")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.wardPlaceholder")}
                      disabled={isLoading}
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
                <FormLabel>{t("address.address")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("address.addressPlaceholder")}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || address?.isDefault}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  {t("address.setDefault")}
                </FormLabel>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("btn.cancel", { ns: "common" })}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              disabled={isLoading}
            >
              {isLoading ? t("address.saving") : t("address.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
