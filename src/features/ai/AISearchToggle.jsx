import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AISearchToggle({ enabled, onToggle, disabled, available = true }) {
  const isDisabled = disabled || !available;

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id="ai-search"
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={isDisabled}
        />
        <Label htmlFor="ai-search" className={`flex items-center gap-1 text-sm ${isDisabled ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}`}>
          <Search className={`h-3.5 w-3.5 ${available ? "text-apple-blue" : "text-muted-foreground"}`} />
          Tìm kiếm AI
        </Label>
      </div>
      {!available && (
        <span className="text-xs text-muted-foreground">
          Tìm kiếm AI đang tắt
        </span>
      )}
      {enabled && (
        <span className="text-xs text-muted-foreground">
          Gõ mô tả tự nhiên, AI sẽ tìm sản phẩm phù hợp
        </span>
      )}
    </div>
  );
}
