import { useState, useEffect, useRef } from "react";
import { Send, AlertTriangle, Bot, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

const QUICK_SYMPTOMS = [
    "Headache",
    "Fever",
    "Chest Pain",
    "Stomach Ache",
    "Back Pain",
    "Cough",
    "Breathing Difficulty",
];

const ChatInterface = ({
    messages,
    onSend,
    sending,
    isEmergency,
    onEnd,
    status,
    loading,
}) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || sending) return;
        onSend(text);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isActive = status === "active" || status === "emergency";

    return (
        <div className="h-full flex flex-col bg-neutral-50 dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white dark:bg-dark-card border-b border-neutral-100 dark:border-dark-border px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
                        AyurAyush AI Assistant
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isActive
                            ? "Online - Describe your symptoms"
                            : "Conversation ended"}
                    </p>
                </div>
                {isActive && (
                    <Button
                        variant="danger"
                        size="sm"
                        className="ml-auto"
                        onClick={onEnd}
                        loading={loading}
                    >
                        End Chat
                    </Button>
                )}
            </div>

            {/* Emergency Banner */}
            {isEmergency && (
                <div className="sticky top-15.25 z-10 bg-error-600 text-white px-4 py-2 flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span className="font-semibold text-sm">
                        Emergency detected - Seek immediate medical help if
                        needed.
                    </span>
                </div>
            )}

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
                aria-live="polite"
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] ${msg.role === "user" ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl rounded-br-sm shadow-md" : "bg-white dark:bg-dark-elevated border border-neutral-100 dark:border-dark-border text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-bl-sm shadow-sm"} px-4 py-2.5 text-sm leading-relaxed`}
                        >
                            {msg.isEmergency && (
                                <div className="flex items-center gap-1 text-error-600 dark:text-error-400 text-xs font-medium mb-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Emergency Detected
                                </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-dark-elevated border border-neutral-100 dark:border-dark-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-primary-300 dark:bg-primary-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                <div className="w-2 h-2 bg-primary-300 dark:bg-primary-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                <div className="w-2 h-2 bg-primary-300 dark:bg-primary-500 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Symptoms */}
            {isActive && messages.length <= 2 && (
                <div className="border-t border-neutral-100 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 px-4 py-2">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Quick symptoms:
                    </p>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
                        {QUICK_SYMPTOMS.map((symptom) => (
                            <button
                                key={symptom}
                                onClick={() => onSend(symptom)}
                                disabled={sending}
                                className="text-xs bg-white dark:bg-dark-elevated border border-neutral-200 dark:border-dark-border px-3 py-1.5 rounded-full hover:bg-primary-600 hover:text-white hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:border-primary-600 transition-colors text-neutral-700 dark:text-neutral-300"
                            >
                                {symptom}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            {isActive && (
                <div className="sticky bottom-0 border-t border-neutral-100 dark:border-dark-border bg-white dark:bg-dark-card p-3">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your symptoms..."
                            disabled={sending}
                            className="flex-1 h-10 px-4 border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated rounded-full text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full flex items-center justify-center hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { ChatInterface };
export default ChatInterface;
