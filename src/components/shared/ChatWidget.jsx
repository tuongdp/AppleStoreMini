import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { MessageCircle, X, Send, Sparkles, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMessageMutation } from "@/store/api/chatApi";
import { useNavigate } from "react-router-dom";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const user = useSelector((s) => s.auth.user);
    const [sendMsg] = useSendMessageMutation();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || loading) return;
        const text = message.trim();
        setMessage("");
        setMessages((prev) => [...prev, { senderType: "USER", content: text, createdAt: new Date().toISOString() }]);
        setLoading(true);
        try {
            const result = await sendMsg({ message: text }).unwrap();
            if (result.reply) {
                setMessages((prev) => [...prev, { senderType: "AI", content: result.reply, createdAt: new Date().toISOString() }]);
            }
            if (result.products?.length > 0) {
                setMessages((prev) => [...prev, { senderType: "AI", content: null, products: result.products, createdAt: new Date().toISOString() }]);
            }
        } catch {
            setMessages((prev) => [...prev, { senderType: "AI", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.", createdAt: new Date().toISOString() }]);
        }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] flex-col rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-3 rounded-t-2xl bg-blue-600 px-4 py-3 text-white">
                        <Sparkles className="h-5 w-5" />
                        <div>
                            <p className="text-sm font-semibold">Apple Store Assistant</p>
                            <p className="text-xs text-blue-100">AI hỗ trợ 24/7 · Gõ "hỗ trợ" để gặp người thật</p>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <Bot className="h-10 w-10 mb-2 text-blue-500" />
                                <p className="text-sm font-medium">Xin chào! Mình có thể giúp gì cho bạn?</p>
                                <p className="text-xs mt-1">Hỏi về sản phẩm, giá, đặt hàng...</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.senderType === "USER" ? "justify-end" : "justify-start"}`}>
                                {msg.content ? (
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.senderType === "USER"
                                        ? "bg-blue-600 text-white rounded-br-md"
                                        : "bg-muted text-foreground rounded-bl-md"
                                        }`}>
                                        {msg.content}
                                    </div>
                                ) : msg.products ? (
                                    <div className="w-full space-y-2">
                                        {msg.products.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => navigate(`/product/${p.slug}`)}
                                                className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/50 p-2 text-left hover:bg-muted transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{p.name}</p>
                                                    <p className="text-xs text-blue-600 font-semibold">{p.price?.toLocaleString("vi-VN")}đ</p>
                                                </div>
                                                <span className="text-xs text-blue-600 font-medium">Xem →</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-2 border-t border-border p-3"
                    >
                        <Input
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 rounded-full border-border text-sm"
                        />
                        <Button type="submit" size="icon" className="h-9 w-9 rounded-full" disabled={!message.trim() || loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
}
