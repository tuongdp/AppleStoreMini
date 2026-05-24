import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchProductsQuery } from "@/store/api/productsApi";
import { useGetNewsQuery } from "@/store/api/newsApi";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/lib/constants";
import { getNewsHref, groupProductsByCategory } from "@/features/products/utils/searchResults";

export function useProductSearch() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const debouncedKeyword = useDebounce(keyword, 300);

    const canSearch = debouncedKeyword.trim().length >= 2;

    const { data, isFetching: isProductsFetching } = useSearchProductsQuery(debouncedKeyword, {
      skip: !canSearch,
    });

    const { data: newsData, isFetching: isNewsFetching } = useGetNewsQuery(
        { search: debouncedKeyword, limit: 4 },
        { skip: !canSearch },
    );

    const suggestions = useMemo(() => data || [], [data]);
    const groupedSuggestions = useMemo(
        () => groupProductsByCategory(suggestions),
        [suggestions],
    );
    const newsSuggestions = newsData?.news || [];
    const isFetching = isProductsFetching || isNewsFetching;

    const handleKeywordChange = useCallback((value) => {
        setKeyword(value);
        setIsOpen(value.trim().length >= 2);
    }, []);

    const handleSearch = useCallback(() => {
        if (!keyword.trim()) return;
        navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(keyword.trim())}`);
        setIsOpen(false);
    }, [keyword, navigate]);

    const handleSelectSuggestion = useCallback(
        (product) => {
            navigate(ROUTES.PRODUCT_DETAIL(product.slug));
            setKeyword("");
            setIsOpen(false);
        },
        [navigate],
    );

    const handleSelectNews = useCallback(
        (news) => {
            navigate(getNewsHref(news));
            setKeyword("");
            setIsOpen(false);
        },
        [navigate],
    );

    const handleClear = useCallback(() => {
        setKeyword("");
        setIsOpen(false);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
      keyword,
      isOpen,
      isFetching,
      isLoading: isFetching,
      suggestions,
      groupedSuggestions,
      newsSuggestions,
      handleKeywordChange,
      handleSearch,
      handleSelectSuggestion,
      handleSelectNews,
      handleClear,
      handleClose,
    };
}
