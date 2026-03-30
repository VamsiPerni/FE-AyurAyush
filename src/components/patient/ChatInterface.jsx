import { useState, useEffect, useRef } from "react";
import { Send, AlertTriangle, Bot, User, Sparkles } from "lucide-react";
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
        <div className="h-full flex flex-col bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm text-neutral-800">
                        AyurAyush AI Assistant
                    </h3>
                    <p className="text-xs text-neutral-500">
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
                            className={`max-w-[80%] ${msg.role === "user" ? "bg-primary-600 text-white rounded-2xl rounded-br-sm" : "bg-white border border-neutral-100 text-neutral-800 rounded-2xl rounded-bl-sm shadow-sm"} px-4 py-2.5 text-sm leading-relaxed`}
                        >
                            {msg.isEmergency && (
                                <div className="flex items-center gap-1 text-error-600 text-xs font-medium mb-1">
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
                        <div className="bg-white border border-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:0ms]" />
                                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:150ms]" />
                                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Symptoms */}
            {isActive && messages.length <= 2 && (
                <div className="border-t border-neutral-100 bg-white/80 px-4 py-2">
                    <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Quick symptoms:
                    </p>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
                        {QUICK_SYMPTOMS.map((symptom) => (
                            <button
                                key={symptom}
                                onClick={() => onSend(symptom)}
                                disabled={sending}
                                className="text-xs bg-white border border-neutral-200 px-3 py-1.5 rounded-full hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors"
                            >
                                {symptom}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            {isActive && (
                <div className="sticky bottom-0 border-t border-neutral-100 bg-white p-3">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your symptoms..."
                            disabled={sending}
                            className="flex-1 h-10 px-4 border border-neutral-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
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
