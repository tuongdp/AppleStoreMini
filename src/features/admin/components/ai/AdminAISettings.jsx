import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminAISettings() {
  const [apiKey, setApiKey] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai_api_key") || "";
    setApiKey(saved);
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("ai_api_key", apiKey.trim());
    } else {
      localStorage.removeItem("ai_api_key");
    }
    toast.success("Đã lưu cấu hình AI");
  };

  const handleClear = () => {
    localStorage.removeItem("ai_api_key");
    setApiKey("");
    toast.success("Đã xóa API key");
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình AI</CardTitle>
          <CardDescription>
            Nhập API key để kích hoạt các tính năng AI (tư vấn, so sánh, tìm kiếm thông minh...).
            Key được lưu trên trình duyệt và gửi kèm mỗi request đến backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="ai-key"
                type="password"
                placeholder="Nhập API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ Google Gemini API key. Lấy key tại{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {apiKey && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Trạng thái:</span>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                Đã cấu hình
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave}>Lưu cấu hình</Button>
        {apiKey && (
          <Button variant="outline" onClick={handleClear}>
            Xóa API key
          </Button>
        )}
      </div>
    </div>
  );
}
