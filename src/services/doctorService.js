import { axiosInstance } from "../axios/axiosInstance";

export const doctorService = {
    getDashboard: async () => {
        const response = await axiosInstance.get("/doctor/dashboard");
        return response.data;
    },

    getAppointments: async (status = "", date = "") => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (date) params.append("date", date);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await axiosInstance.get(
            `/doctor/appointments${query}`,
        );
        return response.data;
    },

    getTodayAppointments: async () => {
        const response = await axiosInstance.get("/doctor/appointments/today");
        return response.data;
    },

    callNextQueuePatient: async () => {
        const response = await axiosInstance.post(
            "/doctor/appointments/queue/next-call",
        );
        return response.data;
    },

    callQueuePatient: async (appointmentId) => {
        const response = await axiosInstance.post(
            `/doctor/appointments/${encodeURIComponent(appointmentId)}/call`,
        );
        return response.data;
    },

    startConsultation: async (appointmentId) => {
        const response = await axiosInstance.post(
            `/doctor/appointments/${encodeURIComponent(appointmentId)}/start-consultation`,
        );
        return response.data;
    },

    getAppointmentDetails: async (appointmentId) => {
        const response = await axiosInstance.get(
            `/doctor/appointments/${encodeURIComponent(appointmentId)}`,
        );
        return response.data;
    },

    completeAppointment: async (appointmentId, data) => {
        const response = await axiosInstance.post(
            `/doctor/appointments/${encodeURIComponent(appointmentId)}/complete`,
            data,
        );
        return response.data;
    },

    getDoctorProfile: async () => {
        const response = await axiosInstance.get("/doctor/profile");
        return response.data;
    },

    updateDoctorProfile: async (data) => {
        const response = await axiosInstance.put("/doctor/profile", data);
        return response.data;
    },
};
