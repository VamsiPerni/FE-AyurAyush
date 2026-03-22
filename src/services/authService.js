import { axiosInstance } from "../axios/axiosInstance";

export const authService = {
    login: async (email, password) => {
        const response = await axiosInstance.post("/auth/login", {
            email,
            password,
        });
        return response.data;
    },

    signup: async (data) => {
        const response = await axiosInstance.post("/auth/signup", data);
        return response.data;
    },

    getMe: async () => {
        const response = await axiosInstance.get("/auth/me");
        return response.data;
    },

    logout: async () => {
        const response = await axiosInstance.get("/auth/logout");
        return response.data;
    },

    checkEmail: async (email) => {
        const response = await axiosInstance.get(
            `/auth/check-email?email=${encodeURIComponent(email)}`,
        );
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await axiosInstance.post("/auth/forgot-password", {
            email,
        });
        return response.data;
    },

    resetPassword: async ({ email, otp, newPassword }) => {
        const response = await axiosInstance.post("/auth/reset-password", {
            email,
            otp,
            newPassword,
        });
        return response.data;
    },
};
