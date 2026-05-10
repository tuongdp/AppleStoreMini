import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await addAddress(values).unwrap();
        toast.success("Thêm địa chỉ thành công");
      }
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-medium text-foreground">
          {isEditing ? "Chỉnh sửa" : "Thêm địa chỉ mới"}
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
                  <FormLabel>{"Họ và tên"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Nhập họ và tên người nhận"}
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
                  <FormLabel>{"Số điện thoại"}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={"Nhập số điện thoại"}
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
                  <FormLabel>{"Tỉnh / Thành phố"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Chọn tỉnh / thành phố"}
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
                  <FormLabel>{"Quận / Huyện"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Chọn quận / huyện"}
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
                  <FormLabel>{"Phường / Xã"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Chọn phường / xã"}
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
                <FormLabel>{"Địa chỉ cụ thể"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={"Số nhà, tên đường..."}
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
                  {"Đặt làm mặc định"}
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
              {"Huỷ"}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
