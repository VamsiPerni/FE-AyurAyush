import { useState, useCallback, useEffect } from "react";
import { chatService } from "../services/chatService";
import { showErrorToast } from "../utils/toastMessageHelper";

const STORAGE_KEY = "ayurayush_active_chat";

const saveToSession = (convId, convStatus) => {
    if (convId) {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ conversationId: convId, status: convStatus }),
        );
    } else {
        sessionStorage.removeItem(STORAGE_KEY);
    }
};

const loadFromSession = () => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const useChatbot = () => {
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [summary, setSummary] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [isEmergency, setIsEmergency] = useState(false);
    const [status, setStatus] = useState(null);
    const [restoring, setRestoring] = useState(true);

    // On mount, restore active conversation from sessionStorage
    useEffect(() => {
        const saved = loadFromSession();
        if (saved?.conversationId) {
            restoreConversation(saved.conversationId);
        } else {
            setRestoring(false);
        }
    }, []);

    const restoreConversation = async (id) => {
        try {
            setRestoring(true);
            const result = await chatService.getConversation(id);
            const data = result.data;
            setConversationId(data.conversationId);
            setMessages(data.messages || []);
            setSummary(data.summary || null);
            setStatus(data.status);
            if (data.messages?.some((m) => m.isEmergency)) setIsEmergency(true);
        } catch {
            // Conversation expired or invalid, clear storage
            sessionStorage.removeItem(STORAGE_KEY);
        } finally {
            setRestoring(false);
        }
    };

    const startConversation = async () => {
        try {
            setLoading(true);
            const result = await chatService.startConversation();
            const data = result.data;
            setConversationId(data.conversationId);
            setMessages([
                {
                    role: "assistant",
                    content: data.greeting,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setSummary(null);
            setIsEmergency(false);
            setStatus("active");
            saveToSession(data.conversationId, "active");
            return data;
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to start conversation",
            );
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (message) => {
        if (!conversationId) return;
        try {
            setSending(true);
            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    content: message,
                    timestamp: new Date().toISOString(),
                },
            ]);
            const result = await chatService.sendMessage(
                conversationId,
                message,
            );
            const data = result.data;
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.aiResponse,
                    timestamp: new Date().toISOString(),
                    isEmergency: data.isEmergency,
                },
            ]);
            if (data.isEmergency) setIsEmergency(true);
            if (data.status) {
                setStatus(data.status);
                saveToSession(conversationId, data.status);
            }
            return data;
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to send message",
            );
            throw err;
        } finally {
            setSending(false);
        }
    };

    const endConversation = async () => {
        if (!conversationId) return;
        try {
            setLoading(true);
            const result = await chatService.endConversation(conversationId);
            const data = result.data;
            setSummary(data.summary);
            setStatus("completed");
            saveToSession(conversationId, "completed");
            return data;
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to end conversation",
            );
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const result = await chatService.getConversations();
            setConversations(result.data?.conversations || []);
            return result.data;
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to fetch conversations",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchConversation = useCallback(async (id) => {
        try {
            setLoading(true);
            const result = await chatService.getConversation(id);
            const data = result.data;
            setConversationId(data.conversationId);
            setMessages(data.messages || []);
            setSummary(data.summary || null);
            setStatus(data.status);
            saveToSession(data.conversationId, data.status);
            return data;
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to fetch conversation",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const resetChat = () => {
        setConversationId(null);
        setMessages([]);
        setSummary(null);
        setIsEmergency(false);
        setStatus(null);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    return {
        conversationId,
        messages,
        summary,
        conversations,
        loading,
        sending,
        isEmergency,
        status,
        restoring,
        startConversation,
        sendMessage,
        endConversation,
        fetchConversations,
        fetchConversation,
        resetChat,
    };
};
