import { axiosInstance } from "../axios/axiosInstance";

export const paymentService = {
    // Patient
    createOrder: async (appointmentId) => {
        const response = await axiosInstance.post("/payments/create-order", {
            appointmentId,
        });
        return response.data;
    },

    verifyPayment: async (payload) => {
        const response = await axiosInstance.post("/payments/verify", payload);
        return response.data;
    },

    getPaymentStatus: async (appointmentId) => {
        const response = await axiosInstance.get(
            `/payments/status/${encodeURIComponent(appointmentId)}`,
        );
        return response.data;
    },

    // Admin
    getRevenueDashboard: async (params = {}) => {
        const query = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v),
        ).toString();
        const response = await axiosInstance.get(
            `/payments/admin/revenue${query ? `?${query}` : ""}`,
        );
        return response.data;
    },

    getAllTransactions: async (params = {}) => {
        const query = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v),
        ).toString();
        const response = await axiosInstance.get(
            `/payments/admin/transactions${query ? `?${query}` : ""}`,
        );
        return response.data;
    },

    initiateRefund: async (appointmentId, reason) => {
        const response = await axiosInstance.post(
            `/payments/admin/refund/${encodeURIComponent(appointmentId)}`,
            { reason },
        );
        return response.data;
    },
};
