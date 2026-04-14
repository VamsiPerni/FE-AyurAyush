import { axiosInstance } from "../axios/axiosInstance";

export const patientService = {
    getDashboard: async () => {
        const response = await axiosInstance.get("/patient/dashboard");
        return response.data;
    },

    getDoctors: async (specialization = "") => {
        const query = specialization
            ? `?specialization=${encodeURIComponent(specialization)}`
            : "";
        const response = await axiosInstance.get(`/patient/doctors${query}`);
        return response.data;
    },

    getAvailableSlots: async (doctorId, date) => {
        const response = await axiosInstance.get(
            `/patient/appointments/available-slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`,
        );
        return response.data;
    },

    bookAppointment: async (data) => {
        const response = await axiosInstance.post(
            "/patient/appointments/book",
            data,
        );
        return response.data;
    },

    getAppointments: async (params = {}) => {
        const options =
            typeof params === "string" ? { status: params } : params || {};

        const searchParams = new URLSearchParams();
        if (options.status) searchParams.set("status", String(options.status));
        if (options.page) searchParams.set("page", String(options.page));
        if (options.limit) searchParams.set("limit", String(options.limit));
        if (options.sort) searchParams.set("sort", String(options.sort));

        const query = searchParams.toString();
        const response = await axiosInstance.get(
            `/patient/appointments${query ? `?${query}` : ""}`,
        );
        return response.data;
    },

    getAppointmentDetails: async (appointmentId) => {
        const response = await axiosInstance.get(
            `/patient/appointments/${encodeURIComponent(appointmentId)}`,
        );
        return response.data;
    },

    cancelAppointment: async (appointmentId) => {
        const response = await axiosInstance.delete(
            `/patient/appointments/${encodeURIComponent(appointmentId)}`,
        );
        return response.data;
    },

    getPatientProfile: async () => {
        const response = await axiosInstance.get("/patient/profile");
        return response.data;
    },

    updatePatientProfile: async (data) => {
        const response = await axiosInstance.put("/patient/profile", data);
        return response.data;
    },

    getEmergencyDelayForDoctor: async (doctorId) => {
        const response = await axiosInstance.get(
            `/patient/emergency-delay/${encodeURIComponent(doctorId)}`,
        );
        return response.data;
    },
};
