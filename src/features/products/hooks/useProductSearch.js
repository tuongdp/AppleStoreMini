import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchProductsQuery } from "@/store/api/productsApi";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/lib/constants";

export function useProductSearch() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const debouncedKeyword = useDebounce(keyword, 300);

    const { data, isFetching } = useSearchProductsQuery(debouncedKeyword, {
      skip: debouncedKeyword.length < 2,
    });

    const suggestions = data || [];

    const handleKeywordChange = useCallback((value) => {
        setKeyword(value);
        setIsOpen(value.length >= 2);
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
      handleKeywordChange,
      handleSearch,
      handleSelectSuggestion,
      handleClear,
      handleClose,
    };
}
