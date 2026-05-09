import NavbarCartButton from "./NavbarCartButton";
import NavbarUserMenu from "./NavbarUserMenu";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function NavbarActions() {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-0.5">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Cart */}
            <NavbarCartButton />

            {/* User */}
            <NavbarUserMenu />
        </div>
    );
}
