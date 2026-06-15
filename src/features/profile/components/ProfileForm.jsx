import { useEffect, useState, useMemo } from "react";
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
import { toast } from "sonner";
import { Search } from "lucide-react";
import provinces from "@/data/province.json";

const provinceOptions = Object.values(provinces).map((p) => ({
    code: p.code,
    label: p.name_with_type,
}));

export default function ProfileForm({ user }) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

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
      form.reset(getProfileFormDefaults(user));
    }
  }, [user, form]);

  const selectedProvince = form.watch("province");
  const { data: wards = [] } = useGetWardsByProvinceQuery(
      selectedProvince,
      { skip: !selectedProvince },
  );

  const [provinceSearch, setProvinceSearch] = useState("");
  const filteredProvinces = useMemo(() => {
      if (!provinceSearch.trim()) return provinceOptions;
      const q = provinceSearch.toLowerCase();
      return provinceOptions.filter((p) => p.label.toLowerCase().includes(q));
  }, [provinceSearch]);

  const [wardSearch, setWardSearch] = useState("");
  const filteredWards = useMemo(() => {
      if (!wardSearch.trim()) return wards;
      const q = wardSearch.toLowerCase();
      return wards.filter((w) => w.name_with_type.toLowerCase().includes(q));
  }, [wards, wardSearch]);

  const onSubmit = async (values) => {
    try {
      const provinceName = provinceOptions.find((p) => p.code === values.province)?.label || "";
      const wardName = wards.find((w) => w.code === values.ward)?.name_with_type || "";
      await updateProfile(getProfileSubmitValues(values, wardName, provinceName)).unwrap();
      toast.success("Cập nhật thông tin thành công");
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
                <FormLabel>{"Họ và tên"}</FormLabel>
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
                  setProvinceSearch("");
                }}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={"Chọn tỉnh/thành phố"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <div
                    className="sticky top-0 z-10 border-b bg-popover px-3 py-2"
                    onPointerDown={(e) => { e.stopPropagation(); }}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Tìm kiếm..."
                        value={provinceSearch}
                        onChange={(e) => setProvinceSearch(e.target.value)}
                        autoComplete="off"
                        onKeyDown={(e) => { if (e.key === "Enter") e.stopPropagation(); }}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredProvinces.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy</p>
                    ) : (
                      filteredProvinces.map((p) => (
                        <SelectItem key={p.code} value={p.code}>
                          {p.label}
                        </SelectItem>
                      ))
                    )}
                  </div>
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
                disabled={!selectedProvince || isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      selectedProvince
                        ? "Chọn xã/phường"
                        : "Vui lòng chọn tỉnh/thành phố trước"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <div
                    className="sticky top-0 z-10 border-b bg-popover px-3 py-2"
                    onPointerDown={(e) => { e.stopPropagation(); }}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Tìm kiếm..."
                        value={wardSearch}
                        onChange={(e) => setWardSearch(e.target.value)}
                        autoComplete="off"
                        onKeyDown={(e) => { if (e.key === "Enter") e.stopPropagation(); }}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
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
                  </div>
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
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
