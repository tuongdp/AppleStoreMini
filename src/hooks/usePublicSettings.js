import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/authSlice";
import { useGetSettingsQuery } from "@/store/api/shopSettingsApi";

export function usePublicSettings() {
    const isAdmin = useSelector(selectIsAdmin);

    const { data, isLoading } = useGetSettingsQuery(undefined, { skip: !isAdmin });

    return { data: data || {}, isLoading: isAdmin ? isLoading : false };
}
