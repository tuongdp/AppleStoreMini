import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n/useTranslation";
import { useUpdateProfileMutation } from "@/store/api/usersApi";
import { profileSchema } from "@/lib/validations";
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
  const { t } = useTranslation("profile");
  const { t: tCommon } = useTranslation();

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
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        gender: user.gender || undefined,
        address: user.address || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values) => {
    try {
      // ✅ updateProfile.onQueryStarted tự dispatch updateUser(data)
      // data đã qua transformResponse → user object trực tiếp
      await updateProfile(values).unwrap();
      toast.success(t("info.saveSuccess"), {
        description: tCommon("toast.updateSuccess"),
      });
    } catch {
      toast.error(t("info.saveFailed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("info.fullName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("info.fullNamePlaceholder")}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email — read only */}
        <FormItem>
          <FormLabel>{t("info.email")}</FormLabel>
          <Input
            value={user?.email || ""}
            disabled
            className="cursor-not-allowed opacity-60"
          />
          <p className="text-xs text-muted-foreground">{t("info.emailNote")}</p>
        </FormItem>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("info.phone")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t("info.phonePlaceholder")}
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
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("info.birthday")}</FormLabel>
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
              <FormLabel>{t("info.gender")}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("info.gender")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">{t("info.male")}</SelectItem>
                  <SelectItem value="female">{t("info.female")}</SelectItem>
                  <SelectItem value="other">{t("info.other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("info.address")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("info.addressPlaceholder")}
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
            {isLoading ? t("info.saving") : t("info.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
