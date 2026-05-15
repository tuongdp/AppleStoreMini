import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAiGenerateDescriptionMutation } from "@/store/api/aiApi";
import { toast } from "sonner";

const STYLES = [
  { value: "seo", label: "Chuẩn SEO" },
  { value: "short", label: "Ngắn gọn" },
  { value: "apple", label: "Apple Style" },
];

export default function AIDescriptionButton({ productName, specs, onDescriptionGenerated }) {
  const [generate, { isLoading }] = useAiGenerateDescriptionMutation();

  const handleGenerate = async (style) => {
    try {
      const res = await generate({
        productName: productName || "",
        specs: specs || "",
        style,
      }).unwrap();
      if (res.description) {
        onDescriptionGenerated(res.description);
        toast.success("Đã tạo mô tả");
      }
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={isLoading || !productName}
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 h-4 w-4" />
          )}
          {isLoading ? "Đang tạo..." : "Tạo mô tả AI"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STYLES.map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => handleGenerate(s.value)}>
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
