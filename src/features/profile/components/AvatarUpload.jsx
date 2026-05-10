import { useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Camera, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUploadAvatarMutation } from "@/store/api/usersApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { IMAGE } from "@/lib/constants";

export default function AvatarUpload({ user }) {
    const { t } = useTranslation("profile");
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploadAvatar, { isLoading }] = useUploadAvatarMutation();

    const handleClick = () => inputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate format
        if (!IMAGE.VALID_TYPES.includes(file.type)) {
            toast.error(t("avatar.invalidFormat"));
            return;
        }

        // Validate size
        if (file.size > IMAGE.MAX_SIZE) {
            toast.error(t("avatar.fileTooLarge"));
            return;
        }

        // Preview ngay lập tức
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Upload
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await uploadAvatar(formData).unwrap();
            dispatch(setCredentials(response));
            toast.success(t("avatar.uploadSuccess"));
        } catch {
            setPreview(null);
            toast.error(t("avatar.uploadFailed"));
        }

        // Reset input để có thể upload lại cùng file
        e.target.value = "";
    };

    const handleRemove = () => {
        setPreview(null);
    };

    const avatarSrc = preview || user?.avatar;
    const initials =
        user?.fullName
            ?.split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="relative">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarSrc} alt={user?.fullName} />
                    <AvatarFallback className="bg-muted text-lg font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {/* Camera overlay */}
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Camera className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={handleClick}
                    disabled={isLoading}
                >
                    {isLoading
                        ? t("status.loading", { ns: "common" })
                        : t("info.changeAvatar")}
                </Button>

                {avatarSrc && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs text-muted-foreground hover:text-destructive"
                        onClick={handleRemove}
                        disabled={isLoading}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept={IMAGE.VALID_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
