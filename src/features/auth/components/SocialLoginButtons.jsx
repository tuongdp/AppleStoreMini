import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SocialLoginButtons() {
    const { loginWithGoogle, isGoogleLoginLoading } = useAuth();

    return (
        <div className="space-y-3">
            {/* Divider */}
            <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">
                    {"Hoặc tiếp tục với"}
                </span>
                <Separator className="flex-1" />
            </div>

            {/* Google */}
            <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={isGoogleLoginLoading}
                onClick={() => loginWithGoogle()}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                {isGoogleLoginLoading
                    ? "Đang tải..."
                    : "Đăng nhập với Google"}
            </Button>

            {/* Apple Sign In */}
            <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={isGoogleLoginLoading}
            >
                <svg
                    className="mr-2 h-4 w-4 fill-foreground"
                    viewBox="0 0 814 1000"
                >
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.1-73.6-96.2-187.8-96.2-296.7 0-166.7 108.7-254.8 215.7-254.8 56.6 0 103.7 37.5 139 37.5 33.8 0 86.5-39.5 151.8-39.5 24.4 0 108.2 2.6 168.6 80.6zm-159.5-197.7c30.3-35.7 51.5-85.4 51.5-135.1 0-6.5-.6-13-1.9-18.2-48.7 1.9-106.4 32.5-140.8 73.6-26.8 30.3-52 80-52 130.4 0 7.1 1.3 14.3 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 43.4 0 98.4-29 127.7-68.5z" />
                </svg>
                {"Đăng nhập với Apple"}
            </Button>
        </div>
    );
}
