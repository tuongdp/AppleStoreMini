import { useSelector } from "react-redux";
import { useGetProfileQuery } from "@/store/api/usersApi";
import { selectCurrentUser } from "@/store/authSlice";
import ProfileForm from "@/features/profile/components/ProfileForm";
import AvatarUpload from "@/features/profile/components/AvatarUpload";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const userFromRedux = useSelector(selectCurrentUser);

    const { data: profileData, isLoading } = useGetProfileQuery();
    const profile = profileData || userFromRedux;

    if (isLoading && !profile) return <ProfilePageSkeleton />;

    return (
        <div className="space-y-5">
            {/* Profile Info Card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="mb-8 flex flex-wrap items-center gap-6">
                    <AvatarUpload user={profile} />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-foreground">
                            {"Thông tin cá nhân"}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {"Quản lý thông tin cá nhân của bạn"}
                        </p>
                    </div>
                </div>

                <Separator className="mb-8" />

                <ProfileForm user={profile} />
            </div>
        </div>
    );
}

function ProfilePageSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="mb-6 h-4 w-64" />
            <Skeleton className="mb-8 h-px w-full" />
            <div className="mb-8 flex items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
            <Skeleton className="mb-8 h-px w-full" />
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>
        </div>
    );
}
