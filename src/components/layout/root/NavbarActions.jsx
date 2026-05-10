import NavbarCartButton from "./NavbarCartButton";
import NavbarUserMenu from "./NavbarUserMenu";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function NavbarActions() {
    return (
        <div className="flex items-center gap-0.5">
            <ThemeToggle />

            {/* Cart */}
            <NavbarCartButton />

            {/* User */}
            <NavbarUserMenu />
        </div>
    );
}
