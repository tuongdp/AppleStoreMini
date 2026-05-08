import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const LANGUAGES = [
    { value: "vi", label: "Tiếng Việt", short: "VN", flag: "🇻🇳" },
    { value: "en", label: "English", short: "EN", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
    const { currentLanguage, changeLanguage } = useLanguage();

    const current = LANGUAGES.find((l) => l.value === currentLanguage);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 font-medium uppercase"
                >
                    <span>{current?.flag}</span>
                    <span>{current?.short}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.value}
                        onClick={() => changeLanguage(lang.value)}
                        className={
                            currentLanguage === lang.value ? "bg-accent" : ""
                        }
                    >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
