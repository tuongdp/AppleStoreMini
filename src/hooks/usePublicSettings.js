import { useGetPublicSettingsQuery } from "@/store/api/shopSettingsApi";

export function usePublicSettings() {
    const { data, isLoading } = useGetPublicSettingsQuery();

    return { data: data || {}, isLoading };
}
