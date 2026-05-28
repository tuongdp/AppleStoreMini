import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProfileMutation } from "@/store/api/usersApi";
import { profileSchema } from "@/lib/validations";
import {
  getProfileFormDefaults,
  getProfileSubmitValues,
} from "@/features/profile/utils/profileFormValues";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ProfileForm({ user }) {
  // ✅ usersApi.updateProfile đã có onQueryStarted → dispatch(updateUser(data))
  // Không cần dispatch thêm ở đây nữa
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      birthday: "",
      gender: undefined,
      address: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset(getProfileFormDefaults(user));
    }
  }, [user, form]);

  const onSubmit = async (values) => {
    try {
      // ✅ updateProfile.onQueryStarted tự dispatch updateUser(data)
      // data đã qua transformResponse → user object trực tiếp
      await updateProfile(getProfileSubmitValues(values)).unwrap();
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

          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Ngày sinh"}</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Giới tính"}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={"Giới tính"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{"Nam"}</SelectItem>
                    <SelectItem value="female">{"Nữ"}</SelectItem>
                    <SelectItem value="other">{"Khác"}</SelectItem>
                  </SelectContent>
                </Select>
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
              <FormLabel>{"Địa chỉ"}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={"Nhập địa chỉ giao hàng của bạn"}
                  rows={3}
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
