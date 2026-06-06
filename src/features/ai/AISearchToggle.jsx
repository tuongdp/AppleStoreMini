import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AISearchToggle({ enabled, onToggle, disabled }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id="ai-search"
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
        <Label htmlFor="ai-search" className="flex items-center gap-1 text-sm cursor-pointer">
          <Search className="h-3.5 w-3.5 text-apple-blue" />
          Tìm kiếm AI
        </Label>
      </div>
      {enabled && (
        <span className="text-xs text-muted-foreground">
          Gõ mô tả tự nhiên, AI sẽ tìm sản phẩm phù hợp
        </span>
      )}
    </div>
  );
}
