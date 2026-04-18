import { axiosInstance } from "../axios/axiosInstance";

export const notificationService = {
    getPatientNotifications: async () => {
        const response = await axiosInstance.get("/patient/notifications");
        return response.data;
    },
    getDoctorNotifications: async () => {
        const response = await axiosInstance.get("/doctor/notifications");
        return response.data;
    },
    getAdminNotifications: async () => {
        const response = await axiosInstance.get("/admin/notifications");
        return response.data;
    },
};
