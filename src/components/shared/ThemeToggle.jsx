import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Giao diện">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-[transform,opacity] dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-[transform,opacity] dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Chuyển đổi giao diện</span>
        </Button>
      </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {"Giao diện"}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          {"Sáng"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          {"Tối"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          {"Hệ thống"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
