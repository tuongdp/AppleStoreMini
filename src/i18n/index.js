import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import viCommon from "./locales/vi/common.json";
import viAuth from "./locales/vi/auth.json";
import viProduct from "./locales/vi/product.json";
import viCart from "./locales/vi/cart.json";
import viCheckout from "./locales/vi/checkout.json";
import viOrder from "./locales/vi/order.json";
import viProfile from "./locales/vi/profile.json";
import viAdmin from "./locales/vi/admin.json";
import viValidation from "./locales/vi/validation.json";

i18n.use(initReactI18next).init({
    resources: {
        vi: {
            common: viCommon,
            auth: viAuth,
            product: viProduct,
            cart: viCart,
            checkout: viCheckout,
            order: viOrder,
            profile: viProfile,
            admin: viAdmin,
            validation: viValidation,
        },
    },
    lng: "vi",
    fallbackLng: "vi",
    ns: ["common", "auth", "product", "cart", "checkout", "order", "profile", "admin", "validation"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
});

export default i18n;
