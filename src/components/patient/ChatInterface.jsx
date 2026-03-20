import { useState, useEffect, useRef } from "react";
import { Send, AlertTriangle, Bot, User, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

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
        <div className="h-full flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            {/* Emergency Banner */}
            {isEmergency && (
                <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2 animate-pulse">
                    <AlertTriangle size={18} />
                    <span className="font-semibold text-sm">
                        🚨 Emergency Detected — Please seek immediate medical
                        help if needed!
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="bg-[#065A82] text-white px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">
                        AyurAyush AI Assistant
                    </h3>
                    <p className="text-xs text-white/70">
                        {isActive
                            ? "Online — Describe your symptoms"
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === "user"
                                        ? "bg-[#1C7293]"
                                        : "bg-[#065A82]"
                                }`}
                            >
                                {msg.role === "user" ? (
                                    <User size={14} className="text-white" />
                                ) : (
                                    <Bot size={14} className="text-white" />
                                )}
                            </div>
                            <div
                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === "user"
                                        ? "bg-[#1C7293] text-white rounded-br-md"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                                }`}
                            >
                                {msg.isEmergency && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs font-medium mb-1">
                                        <AlertTriangle size={12} />
                                        Emergency Detected
                                    </div>
                                )}
                                <p className="whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 items-end">
                            <div className="w-7 h-7 rounded-full bg-[#065A82] flex items-center justify-center">
                                <Bot size={14} className="text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                <div className="flex gap-1.5">
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    />
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    />
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Symptoms */}
            {isActive && messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Sparkles size={12} /> Quick symptoms:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_SYMPTOMS.map((symptom) => (
                            <button
                                key={symptom}
                                onClick={() => onSend(symptom)}
                                disabled={sending}
                                className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-[#065A82] hover:text-white hover:border-[#065A82] transition-colors"
                            >
                                {symptom}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            {isActive && (
                <div className="border-t border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your symptoms..."
                            disabled={sending}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className="w-10 h-10 bg-[#065A82] text-white rounded-full flex items-center justify-center hover:bg-[#054a6b] transition-colors disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { ChatInterface };
