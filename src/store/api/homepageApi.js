import { baseApi } from "./baseApi";
import { parseProduct } from "./helpers";

export const homepageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getHomepage: builder.query({
            query: ({ sections, limit = 10 } = {}) => ({
                url: "/homepage",
                params: {
                    limit,
                    ...(sections?.length ? { sections: sections.join(",") } : {}),
                },
            }),
            keepUnusedDataFor: 300,
            providesTags: ["Products", "Categories", "Banners"],
            transformResponse: (response) => {
                const data = response.data || {};
                return {
                    banners: data.banners || [],
                    categories: data.categories || [],
                    newReleaseProducts: (data.newProducts || []).map(parseProduct),
                    restockedProducts: [],
                    categorySections: (data.categorySections || []).map((section) => ({
                        ...section,
                        products: (section.products || []).map(parseProduct),
                    })),
                };
            },
        }),
    }),
});

export const { useGetHomepageQuery } = homepageApi;
