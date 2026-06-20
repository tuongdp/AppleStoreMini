import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProfileMutation } from "@/store/api/usersApi";
import { profileSchema } from "@/lib/validations";
import { useGetWardsByProvinceQuery } from "@/store/api/addressApi";
import {
  getProfileFormDefaults,
  getProfileSubmitValues,
} from "@/features/profile/utils/profileFormValues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import SearchableSelect from "@/components/ui/searchable-select";
import provinces from "@/data/province.json";

const provinceOptions = Object.values(provinces).map((p) => ({
    code: p.code,
    label: p.name_with_type,
}));

export default function ProfileForm({ user }) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      ward: "",
      streetAddress: "",
    },
  });

  useEffect(() => {
    if (user) {
      const defaults = getProfileFormDefaults(user);
      form.reset(defaults);
      if (!defaults.province && !defaults.streetAddress) {
        setIsEditingAddress(false);
      }
    }
  }, [user, form]);

  const selectedProvince = form.watch("province");
  const { data: wards = [] } = useGetWardsByProvinceQuery(
      selectedProvince,
      { skip: !selectedProvince },
  );
  const wardOptions = wards.map((w) => ({ code: w.code, label: w.name_with_type }));

  const onSubmit = async (values) => {
    try {
      const provinceName = provinceOptions.find((p) => p.code === values.province)?.label || "";
      const wardName = wardOptions.find((w) => w.code === values.ward)?.label || "";
      await updateProfile(getProfileSubmitValues(values, wardName, provinceName)).unwrap();
      toast.success("Cập nhật thông tin thành công");
      setIsEditingAddress(false);
    } catch {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Họ và tên"}<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder={"Nhập họ và tên"}
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
                <FormLabel>{"Số điện thoại"}<span className="text-destructive">*</span></FormLabel>
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

          <FormItem>
            <FormLabel>{"Email"}</FormLabel>
            <Input
              value={user?.email || ""}
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-muted-foreground">{"Email không thể thay đổi"}</p>
          </FormItem>
        </div>

        {!isEditingAddress ? (
          <div className="space-y-2">
            <FormLabel>{"Địa chỉ"}</FormLabel>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <p className="flex-1 text-sm text-muted-foreground">{user?.address || "Chưa có địa chỉ"}</p>
              <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full" onClick={() => setIsEditingAddress(true)}>Sửa</Button>
            </div>
          </div>
        ) : (
          <>
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
                    disabled={isLoading}
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
                    disabled={!selectedProvince || isLoading}
                    emptyText="Không có dữ liệu"
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
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="rounded-full px-8"
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
