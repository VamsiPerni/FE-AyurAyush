import { User, Bot, AlertTriangle } from "lucide-react";

export const PatientChatHistory = ({ chatHistory, className = "" }) => {
    if (!chatHistory || chatHistory.length === 0) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {chatHistory.map((msg, idx) => {
                const isUser = msg.role === "user";
                const isEmergencyMsg = msg.isEmergency;

                return (
                    <div
                        key={idx}
                        className={`flex gap-3 ${
                            isUser ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                                isUser
                                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            }`}
                        >
                            {isUser ? (
                                <User className="w-4 h-4" />
                            ) : (
                                <Bot className="w-4 h-4" />
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div
                            className={`flex flex-col gap-1 max-w-[85%] ${
                                isUser ? "items-end" : "items-start"
                            }`}
                        >
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                    {isUser ? "Patient" : "Triage AI"}
                                </span>
                                {msg.timestamp && (
                                    <span className="text-[10px] text-neutral-400">
                                        {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </span>
                                )}
                            </div>

                            <div
                                className={`px-4 py-2.5 rounded-2xl shadow-sm border ${
                                    isEmergencyMsg
                                        ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-200"
                                        : isUser
                                        ? "bg-white dark:bg-dark-elevated border-neutral-200 dark:border-dark-border text-neutral-800 dark:text-neutral-200 rounded-tr-sm"
                                        : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30 text-neutral-800 dark:text-neutral-200 rounded-tl-sm"
                                }`}
                            >
                                {isEmergencyMsg && (
                                    <div className="flex items-center gap-1.5 mb-1 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wide">
                                            Emergency Trigger
                                        </span>
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PatientChatHistory;
