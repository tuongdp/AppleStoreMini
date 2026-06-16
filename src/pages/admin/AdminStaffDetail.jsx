import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useGetUserByIdQuery } from "@/store/api/usersApi";
import AdminUserDetailComponent from "@/features/admin/components/users/AdminUserDetail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

export default function AdminStaffDetailPage() {
    const { id } = useParams();
    const { data: user, isLoading, isError } = useGetUserByIdQuery(id);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-4 lg:col-span-2">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="mb-4 text-muted-foreground">{"Không tìm thấy nhân viên"}</p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to={ROUTES.ADMIN_STAFF}>{"Quản lý nhân viên"}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to={ROUTES.ADMIN_STAFF}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    {"Quản lý nhân viên"}
                </Link>
            </Button>
            <AdminUserDetailComponent user={user} />
        </div>
    );
}
