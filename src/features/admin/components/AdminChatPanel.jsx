import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ChevronLeft, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    useGetConversationsQuery,
    useGetChatMessagesQuery,
    useAdminReplyMutation,
    useCloseConversationMutation,
} from "@/store/api/chatApi";
import { useSocket } from "@/hooks/useSocket";

export default function AdminChatPanel() {
    const [open, setOpen] = useState(false);
    const [activeConv, setActiveConv] = useState(null);
    const [message, setMessage] = useState("");
    const scrollRef = useRef(null);

    const { data, isLoading, refetch } = useGetConversationsQuery({ status: "active" });
    const { data: messages, refetch: refetchMsgs } = useGetChatMessagesQuery(activeConv, { skip: !activeConv });
    const [sendReply, { isLoading: sending }] = useAdminReplyMutation();
    const [closeConv] = useCloseConversationMutation();

    const handleChatEvent = useCallback((type, data) => {
        refetch();
        if (type === "message" && activeConv === data.conversationId) {
            refetchMsgs();
        }
    }, [activeConv, refetch, refetchMsgs]);
    useSocket(() => {}, () => {}, handleChatEvent);

    const conversations = data?.conversations || [];
    const unreadCount = data?.unreadCount || 0;

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const allMessages = messages || [];

    const handleSend = async () => {
        if (!message.trim() || !activeConv || sending) return;
        const text = message.trim();
        setMessage("");
        setLocalMsgs((prev) => ({
            ...prev,
            [activeConv]: [...(prev[activeConv] || []), { senderType: "ADMIN", content: text, createdAt: new Date().toISOString() }],
        }));
        try {
            await sendReply({ id: activeConv, message: text }).unwrap();
        } catch { }
    };

    const handleClose = async (id) => {
        await closeConv(id);
        setActiveConv(null);
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9"
                onClick={() => setOpen(!open)}
            >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </Button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 flex h-[500px] w-96 flex-col rounded-2xl border border-border bg-card shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center gap-3 rounded-t-2xl bg-green-600 px-4 py-3 text-white">
                            <MessageCircle className="h-5 w-5" />
                            <p className="text-sm font-semibold">Hỗ trợ khách hàng</p>
                            <Badge className="ml-auto bg-white/20 text-white text-xs">{unreadCount} mới</Badge>
                        </div>

                        {activeConv ? (
                            <>
                                {/* Back + Close */}
                                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveConv(null)}>
                                        <ChevronLeft className="h-3 w-3 mr-1" /> Danh sách
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={() => handleClose(activeConv)}>
                                        Đóng
                                    </Button>
                                </div>

                                {/* Messages */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                                    {allMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.senderType === "ADMIN" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${msg.senderType === "ADMIN"
                                                ? "bg-green-600 text-white rounded-br-md"
                                                : msg.senderType === "AI" ? "bg-blue-100 text-blue-900 rounded-bl-md" : "bg-muted text-foreground rounded-bl-md"
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input */}
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex items-center gap-2 border-t border-border p-3"
                                >
                                    <Input
                                        placeholder="Trả lời..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="flex-1 rounded-full border-border text-xs h-8"
                                    />
                                    <Button type="submit" size="icon" className="h-8 w-8 rounded-full" disabled={!message.trim() || sending}>
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </form>
                            </>
                        ) : (
                            /* Conversation list */
                            <div className="flex-1 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
                                ) : conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                        <Bot className="h-8 w-8 mb-2" />
                                        <p className="text-sm">Chưa có yêu cầu hỗ trợ</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setActiveConv(conv.id)}
                                            className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate">{conv.user?.fullName || conv.user?.email || "Khách"}</p>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(conv.updatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                            </div>
                                            <Badge className={`text-[10px] h-5 ${conv.status === "PENDING_ADMIN" ? "bg-red-100 text-red-700" : conv.status === "HUMAN_ASSIGNED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                                {conv.status === "AI_CHATTING" ? "AI" : conv.status === "PENDING_ADMIN" ? "Chờ" : "Admin"}
                                            </Badge>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
