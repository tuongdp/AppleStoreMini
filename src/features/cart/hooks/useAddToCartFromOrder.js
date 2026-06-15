import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCartFromServer } from "@/store/cartSlice";
import {
    useAddToCartMutation,
    useLazyGetServerCartQuery,
} from "@/store/api/cartApi";
import { selectIsAuthenticated } from "@/store/authSlice";
import { toggleCartDrawer } from "@/store/uiSlice";
import { toast } from "sonner";
import { parseJsonField } from "@/lib/utils";

function resolveVariantId(orderItem) {
    if (orderItem.variant?.id) return orderItem.variant.id;
    if (orderItem.variantId) return orderItem.variantId;
    return null;
}

export function useAddToCartFromOrder() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [addToCartApi] = useAddToCartMutation();
    const [fetchServerCart] = useLazyGetServerCartQuery();

    const handleReOrder = async (order) => {
        const items = order.items || [];
        if (items.length === 0) {
            toast.warning("Đơn hàng không có sản phẩm nào để mua lại");
            return;
        }

        let addedCount = 0;
        let skippedCount = 0;
        const errorMessages = [];

        for (const oi of items) {
            const variantId = resolveVariantId(oi);
            if (!variantId) {
                skippedCount++;
                continue;
            }

            const quantity = oi.quantity || 1;

            if (isAuthenticated) {
                try {
                    await addToCartApi({ variantId, quantity }).unwrap();
                    addedCount++;
                } catch (err) {
                    // Lấy message từ BE: { success: false, message: "Sản phẩm đã hết hàng" }
                    const serverMsg = err.data?.message || "Không thể thêm vào giỏ hàng";
                    errorMessages.push(`${oi.name || "Sản phẩm"}: ${serverMsg}`);
                    skippedCount++;
                }
            } else {
                const product = oi.product || oi.variant?.product || {};
                const variant = oi.variant || {};

                dispatch(
                    addToCart({
                        product: {
                            ...product,
                            variantId,
                            name: oi.name || product?.name || "Sản phẩm",
                            images:
                                parseJsonField(product.images) ||
                                product.images ||
                                parseJsonField(variant.images) ||
                                variant.images ||
                                [],
                        },
                        variant: {
                            ...variant,
                            id: variantId,
                            inStock: variant.inStock ?? product.inStock ?? true,
                            stock: variant.stock ?? product.stock ?? 99,
                        },
                        variantId,
                        quantity,
                    })
                );
                addedCount++;
            }
        }

        if (addedCount === 0 && skippedCount === 0) {
            toast.error("Không thể mua lại sản phẩm, vui lòng thử lại");
            return;
        }

        if (skippedCount > 0) {
            if (addedCount > 0) {
                toast.warning(
                    `Đã thêm ${addedCount}/${items.length} sản phẩm (${skippedCount} biến thể không khả dụng)`
                );
            } else {
                toast.error(
                    errorMessages.length > 0
                        ? errorMessages.join("\n")
                        : "Không thể mua lại sản phẩm, vui lòng thử lại"
                );
            }
        } else {
            toast.success(
                `Đã thêm ${addedCount} sản phẩm từ đơn hàng #${order.code} vào giỏ hàng`
            );
        }

        // Sau khi thêm từ server → sync về local Redux
        if (isAuthenticated && addedCount > 0) {
            try {
                const { data } = await fetchServerCart();
                if (data?.data) {
                    dispatch(setCartFromServer(data.data));
                }
            } catch { /* noop */ }
        }

        dispatch(toggleCartDrawer(true));
        return addedCount;
    };

    return handleReOrder;
}
