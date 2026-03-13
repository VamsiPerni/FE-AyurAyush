import { axiosInstance } from "../axios/axiosInstance";

export const chatService = {
  startConversation: async () => {
    const response = await axiosInstance.post("/chat/start");
    return response.data;
  },

  sendMessage: async (conversationId, message) => {
    const response = await axiosInstance.post("/chat/message", {
      conversationId,
      message,
    });
    return response.data;
  },

  endConversation: async (conversationId) => {
    const response = await axiosInstance.post("/chat/end", { conversationId });
    return response.data;
  },

  getConversations: async () => {
    const response = await axiosInstance.get("/chat");
    return response.data;
  },

  getConversation: async (conversationId) => {
    const response = await axiosInstance.get(
      `/chat/${encodeURIComponent(conversationId)}`,
    );
    return response.data;
  },
};
