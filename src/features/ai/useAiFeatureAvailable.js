import { useAiHealthQuery } from "@/store/api/aiApi";

export default function useAiFeatureAvailable(featureKey) {
    const { data: aiHealth, isLoading, isFetching } = useAiHealthQuery();
    const available = aiHealth
        ? Boolean(aiHealth.aiEnabled && aiHealth.features?.[featureKey] !== false)
        : true;

    return { available, isLoading: isLoading || isFetching, aiHealth };
}
