import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Loader2, Bot, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "bot",
            text: "Xin chào! Tôi là trợ lý AI của Apple Store Mini. Tôi có thể tư vấn sản phẩm, so sánh cấu hình, gợi ý sản phẩm phù hợp với nhu cầu của bạn. Bạn cần giúp gì ạ?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            const data = await res.json();
            const reply = data?.data?.reply || "Xin lỗi, tôi chưa hiểu ý bạn. Bạn có thể hỏi lại được không?";
            const products = data?.data?.products || [];

            setMessages((prev) => [...prev, { role: "bot", text: reply, products }]);
        } catch {
            toast.error("Không thể kết nối AI, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
                    open
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-apple-blue text-white",
                )}
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-border bg-card shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 rounded-t-2xl border-b border-border bg-muted/50 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-apple-blue text-white">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Trợ lý AI</p>
                            <p className="text-xs text-muted-foreground">Apple Store Mini</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-2",
                                    msg.role === "user" && "flex-row-reverse",
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                        msg.role === "bot"
                                            ? "bg-apple-blue/10 text-apple-blue"
                                            : "bg-muted text-foreground",
                                    )}
                                >
                                    {msg.role === "bot" ? (
                                        <Bot className="h-3.5 w-3.5" />
                                    ) : (
                                        <User className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                                        msg.role === "bot"
                                            ? "bg-muted text-foreground"
                                            : "bg-apple-blue text-white",
                                    )}
                                >
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.products?.length > 0 && (
                                        <div className="mt-2 space-y-1.5 border-t border-border pt-2">
                                            {msg.products.map((p) => (
                                                <Link
                                                    key={p.slug}
                                                    to={`/products/${p.slug}`}
                                                    target="_blank"
                                                    onClick={() => setOpen(false)}
                                                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-background/50"
                                                >
                                                    <span className="line-clamp-1 font-medium">{p.name}</span>
                                                    <span className="shrink-0 text-muted-foreground">
                                                        {p.price ? formatPrice(p.price) : "Liên hệ"}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-apple-blue/10 text-apple-blue">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="rounded-2xl bg-muted px-4 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-border p-3">
                        <div className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập câu hỏi..."
                                rows={1}
                                className="min-h-0 resize-none rounded-xl text-sm"
                                disabled={loading}
                            />
                            <Button
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-full"
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
