import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMessageMutation } from "@/store/api/chatApi";
import { buildFocusedChatReply, filterChatProductsByMessage } from "@/features/ai/chatProductFilter";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [sendMessage, { isLoading }] = useSendMessageMutation();
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
        const handleKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (event) => {
        event?.preventDefault();
        const text = message.trim();
        if (!text || isLoading) return;

        setMessage("");

        const history = messages
            .filter((m) => m.content && !m.products)
            .slice(-20)
            .map((m) => ({
                role: m.senderType === "USER" ? "user" : "assistant",
                content: m.content,
            }));

        setMessages((prev) => [
            ...prev,
            { senderType: "USER", content: text, createdAt: new Date().toISOString() },
        ]);

        try {
            const result = await sendMessage({ message: text, history }).unwrap();
            const reply = result?.reply || "Mình chưa có câu trả lời phù hợp. Bạn thử hỏi theo cách khác nhé.";
            const products = filterChatProductsByMessage(text, result?.products || []);
            const focusedReply = buildFocusedChatReply(text, reply, products);

            setMessages((prev) => [
                ...prev,
                { senderType: "AI", content: focusedReply, createdAt: new Date().toISOString() },
                ...(products.length
                    ? [{ senderType: "AI", products, createdAt: new Date().toISOString() }]
                    : []),
            ]);
        } catch (error) {
            console.error("[AI Chat] Error:", error?.data || error?.message || error);
            setMessages((prev) => [
                ...prev,
                {
                    senderType: "AI",
                    content: "Xin lỗi, hệ thống chat AI đang bận. Vui lòng thử lại sau.",
                    createdAt: new Date().toISOString(),
                },
            ]);
        }
    };

    return (
        <>
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Mở chat"
                    className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
                >
                    <MessageCircle className="h-5 w-5" />
                </button>
            )}

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="chat-widget-title"
                    data-testid="chat-widget-dialog"
                    className="fixed inset-0 z-60 flex flex-col bg-card sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100vh-3rem))] sm:w-[min(380px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
                >
                    <div className="flex items-center gap-3 bg-foreground px-4 py-3 text-background sm:rounded-t-2xl">
                        <Bot aria-hidden="true" className="h-5 w-5" />
                        <div className="min-w-0 flex-1">
                            <p id="chat-widget-title" className="truncate text-sm font-semibold">Trợ lý Apple Store</p>
                            <p className="text-xs text-background/70">Hỗ trợ tư vấn sản phẩm bằng AI</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Đóng chat"
                            data-testid="chat-widget-close"
                            className="rounded-full p-1 transition-colors hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
                        aria-live="polite"
                        aria-relevant="additions text"
                    >
                        {messages.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                <Bot className="mb-2 h-10 w-10 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    Xin chào! Mình có thể giúp bạn chọn sản phẩm Apple phù hợp.
                                </p>
                            </div>
                        )}

                        {messages.map((item, index) => (
                            <div key={`${item.senderType}-${index}`} className={`flex ${item.senderType === "USER" ? "justify-end" : "justify-start"}`}>
                                {item.content ? (
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                            item.senderType === "USER"
                                                ? "rounded-br-md bg-foreground text-background"
                                                : "rounded-bl-md bg-muted text-foreground"
                                        }`}
                                    >
                                        {item.content}
                                    </div>
                                ) : item.products ? (
                                    <div className="w-full space-y-2">
                                        {item.products.map((product) => (
                                            <button
                                                key={product.id || product.slug}
                                                type="button"
                                                onClick={() => navigate(`/products/${product.slug}`)}
                                                className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/50 p-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{product.name}</p>
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {Number(product.price || 0).toLocaleString("vi-VN")}đ
                                                    </p>
                                                </div>
                                                <span className="text-xs font-medium text-foreground">Xem</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
                        <Input
                            ref={inputRef}
                            placeholder="Nhập tin nhắn…"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            name="chat-message"
                            autoComplete="off"
                            className="h-9 flex-1 rounded-full border-border text-sm"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            disabled={!message.trim() || isLoading}
                            aria-label="Gửi tin nhắn"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
}
