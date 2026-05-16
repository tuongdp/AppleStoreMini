import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { MessageCircle, X, Send, Sparkles, Bot, Loader2, UserRound, Mail, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMessageMutation, useSendGuestMessageMutation, useCloseMyConversationMutation } from "@/store/api/chatApi";
import { useChatSocket } from "@/hooks/useSocket";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState("info");
    const [guest, setGuest] = useState({ email: "", phone: "", name: "" });
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [convId, setConvId] = useState(null);
    const [chatStatus, setChatStatus] = useState(null);
    const [typing, setTyping] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const typingTimer = useRef(null);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const user = useSelector((s) => s.auth.user);
    const [sendMsg] = useSendMessageMutation();
    const [sendGuest] = useSendGuestMessageMutation();
    const [closeChat] = useCloseMyConversationMutation();

    useChatSocket(convId, (data) => {
        if (data.senderType === "ADMIN") {
            setChatStatus("HUMAN_ASSIGNED");
            setMessages((prev) => [...prev, data]);
        }
        if (data.senderType === "AI" && data.content?.includes("đã tham gia")) {
            setChatStatus("HUMAN_ASSIGNED");
            setMessages((prev) => [...prev, data]);
        }
        if (data.senderType === "AI" && data.content?.includes("đã kết thúc")) {
            setChatStatus("CLOSED");
            setMessages((prev) => [...prev, data]);
        }
    });

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (open && user) setStep("chat");
    }, [open, user]);

    const handleTyping = () => {
        if (chatStatus !== "HUMAN_ASSIGNED") {
            setTyping(false);
            return;
        }
        setTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2000);
    };

    const handleStartChat = (e) => {
        e?.preventDefault();
        if (!guest.email.trim() || !guest.phone.trim()) return;
        setStep("chat");
        setMessages([{ senderType: "AI", content: `Chào ${guest.name || "bạn"}! Mình có thể giúp gì cho bạn?`, createdAt: new Date().toISOString() }]);
    };

    const handleSend = async (text, displayText = text) => {
        if (!text?.trim() || loading) return;
        if (chatStatus === "CLOSED") { setChatStatus(null); setMessages([]); }
        setMessage("");
        setTyping(false);
        setMessages((prev) => [...prev, { senderType: "USER", content: displayText.trim(), createdAt: new Date().toISOString() }]);
        setLoading(true);
        try {
            const body = user
                ? { message: text.trim() }
                : { message: text.trim(), guestEmail: guest.email, guestPhone: guest.phone, guestName: guest.name };
            const mutation = user ? sendMsg : sendGuest;
            const result = await mutation(body).unwrap();
            const conv = result?.conversation || result?.data?.conversation;
            if (conv?.id) setConvId(conv.id);
            const status = result?.status || result?.data?.status;
            if (status === "PENDING_ADMIN") setChatStatus("PENDING_ADMIN");
            if (status === "AI_CHATTING") setChatStatus(null);
            const reply = result?.reply || result?.data?.reply;
            if (reply) setMessages((prev) => [...prev, { senderType: "AI", content: reply, createdAt: new Date().toISOString() }]);
            const products = result?.products || result?.data?.products;
            if (products?.length) setMessages((prev) => [...prev, { senderType: "AI", content: null, products, createdAt: new Date().toISOString() }]);
        } catch (err) {
            console.error("[Chat] Error:", err?.data || err?.message || err);
            setMessages((prev) => [...prev, { senderType: "AI", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.", createdAt: new Date().toISOString() }]);
        } finally {
            setLoading(false);
        }
        setLoading(false);
    };

    const handleEndChat = async () => {
        if (user) await closeChat().catch(() => { });
        setMessages((prev) => [...prev, { senderType: "AI", content: "🔴 Cuộc trò chuyện đã kết thúc. Cảm ơn bạn!", createdAt: new Date().toISOString() }]);
        setChatStatus("CLOSED");
        setShowEndConfirm(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors sm:h-14 sm:w-14 sm:bottom-6 sm:right-6"
            >
                {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex flex-col bg-card sm:inset-auto sm:bottom-20 sm:right-6 sm:h-[480px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl">
                    <div className="flex items-center gap-3 bg-blue-600 px-4 py-3 text-white sm:rounded-t-2xl">
                        <Sparkles className="h-5 w-5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">
                                {user ? `Chào ${user.fullName?.split(" ").pop() || user.email}` : "Apple Store Assistant"}
                            </p>
                            <p className="text-xs text-blue-100">
                                {chatStatus === "PENDING_ADMIN" ? "⏳ Đang chờ nhân viên..." :
                                    chatStatus === "HUMAN_ASSIGNED" ? "🔵 Đang chat với nhân viên" :
                                        chatStatus === "CLOSED" ? "Đã kết thúc" : "AI hỗ trợ 24/7"}
                            </p>
                        </div>
                        {step === "chat" && chatStatus !== "CLOSED" && (
                            <Button variant="secondary" size="sm" className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={() => handleSend("Mình cần hỗ trợ từ nhân viên")}>
                                <UserRound className="h-3 w-3 mr-1" />Nhân viên
                            </Button>
                        )}
                        {chatStatus === "CLOSED" && (
                            <Button variant="secondary" size="sm" className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={() => { setChatStatus(null); setMessages([]); setConvId(null); }}>
                                <Sparkles className="h-3 w-3 mr-1" />Chat mới
                            </Button>
                        )}
                        <button onClick={() => setOpen(false)} className="sm:hidden"><X className="h-5 w-5" /></button>
                    </div>

                    {step === "info" && !user ? (
                        <form onSubmit={handleStartChat} className="flex-1 flex flex-col p-6 gap-4">
                            <p className="text-sm text-muted-foreground text-center">Vui lòng để lại thông tin để được hỗ trợ</p>
                            <div className="relative">
                                <Input placeholder="Họ tên (không bắt buộc)" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} className="rounded-xl pl-9 text-sm" />
                                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="relative">
                                <Input placeholder="Email *" type="email" required value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className="rounded-xl pl-9 text-sm" />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="relative">
                                <Input placeholder="Số điện thoại *" type="tel" required value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className="rounded-xl pl-9 text-sm" />
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button type="submit" className="rounded-xl" disabled={!guest.email.trim() || !guest.phone.trim()}>Bắt đầu chat</Button>
                        </form>
                    ) : (
                        <>
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                        <Bot className="h-10 w-10 mb-2 text-blue-500" />
                                        <p className="text-sm font-medium">Xin chào! Mình có thể giúp gì cho bạn?</p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.senderType === "USER" ? "justify-end" : "justify-start"}`}>
                                        {msg.content ? (
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.senderType === "USER"
                                                ? "bg-blue-600 text-white rounded-br-md"
                                                : msg.senderType === "ADMIN" ? "bg-green-600 text-white rounded-bl-md"
                                                    : msg.content.includes("đã tham gia") || msg.content.includes("đã kết thúc") || msg.content.includes("Đã gửi yêu cầu")
                                                        ? "bg-blue-50 text-blue-700 text-xs italic rounded-lg px-3 py-1.5"
                                                        : "bg-muted text-foreground rounded-bl-md"}`}>
                                                {msg.content}
                                            </div>
                                        ) : msg.products ? (
                                            <div className="w-full space-y-2">
                                                {msg.products.map((p) => (
                                                    <button key={p.id} onClick={() => navigate(`/product/${p.slug}`)}
                                                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/50 p-2 text-left hover:bg-muted transition-colors">
                                                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-blue-600 font-semibold">{p.price?.toLocaleString("vi-VN")}đ</p></div>
                                                        <span className="text-xs text-blue-600 font-medium">Xem →</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin" /></div></div>
                                )}
                                {typing && chatStatus === "HUMAN_ASSIGNED" && (
                                    <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-xs text-muted-foreground italic">Nhân viên đang nhập...</div></div>
                                )}
                            </div>

                            {chatStatus !== "CLOSED" ? (
                                <>
                                    <form onSubmit={(e) => { e.preventDefault(); handleSend(message); }} className="flex items-center gap-2 border-t border-border p-3">
                                        <Input placeholder="Nhập tin nhắn..." value={message} onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                                            className="flex-1 rounded-full border-border text-sm h-9" />
                                        <Button type="submit" size="icon" className="h-9 w-9 rounded-full" disabled={!message.trim() || loading}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                    {chatStatus === "HUMAN_ASSIGNED" && (
                                        <div className="px-3 pb-2">
                                            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-red-500"
                                                onClick={() => setShowEndConfirm(true)}>
                                                <X className="h-3 w-3 mr-1" />Kết thúc trò chuyện
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-3">
                                    <Button variant="outline" size="sm" className="w-full text-xs"
                                        onClick={() => { setChatStatus(null); setMessages([]); setConvId(null); }}>
                                        <Sparkles className="h-3 w-3 mr-1" />Bắt đầu chat mới
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {showEndConfirm && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                            <div className="bg-card rounded-2xl border border-border p-6 mx-4 text-center shadow-xl">
                                <p className="text-sm font-medium mb-2">Kết thúc trò chuyện?</p>
                                <p className="text-xs text-muted-foreground mb-4">Bạn có thể bắt đầu chat mới bất kỳ lúc nào.</p>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="sm" onClick={() => setShowEndConfirm(false)}>Hủy</Button>
                                    <Button variant="destructive" size="sm" onClick={handleEndChat}>Kết thúc</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
