import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    Send,
    CalendarPlus,
    MessageSquare,
    AlertCircle,
    Timer,
    CircleAlert,
    XCircle,
    Bot,
    Sparkles,
} from "lucide-react";
import { chatService } from "../../services/chatService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ChatMessage } from "../../components/patient/ChatMessage";
import { TypingIndicator } from "../../components/patient/TypingIndicator";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const ChatbotPage = () => {
    const navigate = useNavigate();
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null);
    const [ending, setEnding] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [serverUserPromptCount, setServerUserPromptCount] = useState(0);
    const [serverMaxPrompts, setServerMaxPrompts] = useState(30);
    const [serverRecommendedEndAfter, setServerRecommendedEndAfter] =
        useState(3);

    const localUserPromptCount = messages.filter(
        (msg) => msg.sender === "user",
    ).length;
    const userPromptCount = Math.max(
        localUserPromptCount,
        serverUserPromptCount,
    );
    const promptsRemaining = Math.max(serverMaxPrompts - userPromptCount, 0);
    const shouldRecommendEnd = userPromptCount >= serverRecommendedEndAfter;

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, sending]);

    useEffect(() => {
        if (status === "completed" && conversationId) {
            localStorage.setItem("conversationId", conversationId);
        }
    }, [status, conversationId]);

    const handleStartConsultation = async () => {
        try {
            setLoading(true);
            const startRes = await chatService.startConversation();
            const cid =
                startRes.data?.conversationId || startRes.conversationId;
            const greeting = startRes.data?.greeting || startRes.greeting;
            setConversationId(cid);
            setStatus("active");

            const initialMsgs = [];
            if (greeting) {
                initialMsgs.push({
                    id: Date.now() + 1,
                    sender: "bot",
                    text: greeting,
                });
            }

            const firstMsgText = "Hello, I need a consultation";
            initialMsgs.push({
                id: Date.now() + 2,
                sender: "user",
                text: firstMsgText,
            });
            setMessages(initialMsgs);

            setSending(true);
            const msgRes = await chatService.sendMessage(cid, firstMsgText);
            const replyText = msgRes.data?.aiResponse || msgRes.aiResponse;
            const newStatus = msgRes.data?.status || msgRes.status;
            const nextPromptCount =
                msgRes.data?.userMessageCount || msgRes.userMessageCount;
            const maxUserPrompts =
                msgRes.data?.maxUserPrompts || msgRes.maxUserPrompts;
            const recommendedEndAfterPrompts =
                msgRes.data?.recommendedEndAfterPrompts ||
                msgRes.recommendedEndAfterPrompts;

            if (typeof nextPromptCount === "number") {
                setServerUserPromptCount(nextPromptCount);
            }
            if (typeof maxUserPrompts === "number") {
                setServerMaxPrompts(maxUserPrompts);
            }
            if (typeof recommendedEndAfterPrompts === "number") {
                setServerRecommendedEndAfter(recommendedEndAfterPrompts);
            }

            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 3, sender: "bot", text: replyText },
            ]);
            if (newStatus) setStatus(newStatus);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to start AI consultation.",
            );
        } finally {
            setLoading(false);
            setSending(false);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || sending || status === "completed") return;

        const text = input.trim();
        setInput("");
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), sender: "user", text },
        ]);

        try {
            setSending(true);
            const msgRes = await chatService.sendMessage(conversationId, text);
            const replyText = msgRes.data?.aiResponse || msgRes.aiResponse;
            const newStatus = msgRes.data?.status || msgRes.status;
            const nextPromptCount =
                msgRes.data?.userMessageCount || msgRes.userMessageCount;
            const maxUserPrompts =
                msgRes.data?.maxUserPrompts || msgRes.maxUserPrompts;
            const recommendedEndAfterPrompts =
                msgRes.data?.recommendedEndAfterPrompts ||
                msgRes.recommendedEndAfterPrompts;

            if (typeof nextPromptCount === "number") {
                setServerUserPromptCount(nextPromptCount);
            }
            if (typeof maxUserPrompts === "number") {
                setServerMaxPrompts(maxUserPrompts);
            }
            if (typeof recommendedEndAfterPrompts === "number") {
                setServerRecommendedEndAfter(recommendedEndAfterPrompts);
            }

            if (replyText) {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, sender: "bot", text: replyText },
                ]);
            }
            if (newStatus) setStatus(newStatus);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to send message.",
            );
        } finally {
            setSending(false);
        }
    };

    const handleEndConversation = async () => {
        if (!conversationId || status === "completed") return;

        try {
            setEnding(true);
            const endRes = await chatService.endConversation(conversationId);
            const newStatus =
                endRes.data?.status || endRes.status || "completed";
            const usedFallbackSummary =
                endRes.data?.providerUnavailable || endRes.providerUnavailable;

            localStorage.setItem("conversationId", conversationId);

            setStatus(newStatus);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    sender: "bot",
                    text: "Consultation ended. Please continue to appointment booking.",
                },
            ]);

            if (usedFallbackSummary) {
                showSuccessToast(
                    "AI summary was busy, so a quick summary was generated from your chat.",
                );
            }
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to end conversation.",
            );
        } finally {
            setEnding(false);
            setShowEndConfirm(false);
        }
    };

    // 1. Unstarted State
    if (!conversationId) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="AI Consultation"
                    subtitle="Start a guided symptom discussion before booking"
                />
                <Card className="text-center py-16 border border-neutral-100 dark:border-dark-border shadow-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex flex-col items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
                        <Bot className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                        AyurAyush AI Assistant
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                        Our AI will ask you a few questions about your symptoms
                        to determine urgency and recommend the right specialist.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {["Symptom Analysis", "Emergency Detection", "Smart Triage"].map((feature) => (
                            <span key={feature} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-lg">
                                <Sparkles className="w-3 h-3" /> {feature}
                            </span>
                        ))}
                    </div>
                    <Button
                        size="lg"
                        onClick={handleStartConsultation}
                        loading={loading}
                    >
                        Start Consultation
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 pb-4 h-[calc(100vh-140px)] flex flex-col">
            <PageHeader
                title="AI Consultation"
                subtitle="Please answer clearly so we can assist you better"
            />

            {/* Chat Container */}
            <div className="flex-1 bg-neutral-50 dark:bg-dark-surface rounded-2xl border border-neutral-100 dark:border-dark-border shadow-inner dark:shadow-none flex flex-col overflow-hidden relative">
                {status !== "completed" && (
                    <div className="px-4 py-2.5 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30 text-xs text-primary-800 dark:text-primary-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                        <span className="flex items-center gap-1.5 font-medium">
                            <Timer className="w-3.5 h-3.5" />
                            AI replies usually take 10-20 seconds.
                        </span>
                        <span className="sm:text-right text-primary-900 dark:text-primary-200">
                            {promptsRemaining > 0
                                ? `${promptsRemaining} prompt${promptsRemaining === 1 ? "" : "s"} left. After ${serverRecommendedEndAfter} prompts, end chat and book appointment.`
                                : "Prompt limit reached. End this consultation and proceed to booking."}
                        </span>
                    </div>
                )}

                {/* Messages List */}
                <div
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin"
                    aria-live="polite"
                >
                    {messages.length === 0 && !sending && (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                            <p>Type a message to begin...</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg.text}
                            sender={msg.sender}
                        />
                    ))}

                    {sending && <TypingIndicator />}

                    <div ref={messagesEndRef} className="h-4 w-full" />
                </div>

                {/* Status Completed Banner */}
                {status === "completed" && (
                    <div className="bg-success-50 dark:bg-success-900/10 border-t border-success-100 dark:border-success-800/30 p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center text-success-700 dark:text-success-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-success-900 dark:text-success-300">
                                        Consultation Complete
                                    </h4>
                                    <p className="text-sm text-success-700 dark:text-success-400">
                                        You are now ready to book your
                                        appointment.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    if (conversationId) {
                                        localStorage.setItem(
                                            "conversationId",
                                            conversationId,
                                        );
                                    }
                                    navigate(
                                        `/patient/book-appointment${conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ""}`,
                                        {
                                            state: { conversationId },
                                        },
                                    );
                                }}
                                variant="success"
                                icon={CalendarPlus}
                            >
                                Book Appointment
                            </Button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-3 sm:p-4 bg-white dark:bg-dark-card border-t border-neutral-100 dark:border-dark-border flex items-end gap-3 z-10 shrink-0">
                    <textarea
                        className="flex-1 resize-none bg-neutral-50 dark:bg-dark-elevated border border-neutral-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400 transition-shadow min-h-[48px] max-h-[120px] placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                        placeholder={
                            status === "completed"
                                ? "Consultation has ended."
                                : "Type your symptoms..."
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        disabled={status === "completed" || sending}
                        rows={1}
                    />
                    <Button
                        className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center p-0"
                        onClick={handleSendMessage}
                        disabled={
                            !input.trim() || status === "completed" || sending
                        }
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>

                {status !== "completed" && (
                    <div className="px-4 pb-4 bg-white dark:bg-dark-card border-t border-neutral-100 dark:border-dark-border">
                        <div className="rounded-xl border border-error-200 dark:border-error-700/40 bg-error-50/70 dark:bg-error-900/10 p-3 sm:p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                    <CircleAlert className="w-4.5 h-4.5 text-error-600 dark:text-error-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-error-800 dark:text-error-300">
                                            {shouldRecommendEnd
                                                ? "You have enough details to proceed."
                                                : "End when you are ready to book."}
                                        </p>
                                        <p className="text-xs text-error-700 dark:text-error-400 mt-0.5">
                                            {shouldRecommendEnd
                                                ? "Recommended: end chat now and continue with appointment booking."
                                                : `After ${serverRecommendedEndAfter} prompts, it is best to end and book.`}
                                        </p>
                                    </div>
                                </div>

                                {!showEndConfirm ? (
                                    <Button
                                        type="button"
                                        onClick={() => setShowEndConfirm(true)}
                                        disabled={sending || ending}
                                        className="bg-error-600 hover:bg-error-700 text-white"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        End Conversation
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                setShowEndConfirm(false)
                                            }
                                            disabled={ending}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleEndConversation}
                                            loading={ending}
                                            disabled={sending || ending}
                                            className="bg-error-600 hover:bg-error-700 text-white"
                                        >
                                            Confirm End
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export { ChatbotPage };
export default ChatbotPage;
