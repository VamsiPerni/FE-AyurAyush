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

    getUpcomingAppointments: async ({ date = "", page = 1, limit = 5 } = {}) => {
        const params = new URLSearchParams();
        if (date) params.append("date", date);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await axiosInstance.get(
            `/doctor/appointments/upcoming${query}`,
        );
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

    activateEmergencyDelay: async (reason) => {
        const response = await axiosInstance.post(
            "/doctor/emergency-delay/activate",
            { reason },
        );
        return response.data;
    },

    deactivateEmergencyDelay: async () => {
        const response = await axiosInstance.post(
            "/doctor/emergency-delay/deactivate",
        );
        return response.data;
    },

    getCustomReferences: async () => {
        const response = await axiosInstance.get("/doctor/references");
        return response.data;
    },

    addCustomReference: async (activeTab, itemPayload) => {
        const response = await axiosInstance.post("/doctor/references", {
            activeTab,
            itemPayload,
        });
        return response.data;
    },

    getOwnAvailability: async (date = "") => {
        const query = date ? `?date=${encodeURIComponent(date)}` : "";
        const response = await axiosInstance.get(
            `/doctor/availability${query}`,
        );
        return response.data;
    },

    updateOwnAvailability: async (data) => {
        const response = await axiosInstance.put("/doctor/availability", data);
        return response.data;
    },

    setOwnAvailabilityForDate: async (date, slots) => {
        const response = await axiosInstance.put("/doctor/availability/date", {
            date,
            slots,
        });
        return response.data;
    },

    addOwnAvailabilitySlotForDate: async (date, slot) => {
        const response = await axiosInstance.post(
            "/doctor/availability/date/slot",
            {
                date,
                slot,
            },
        );
        return response.data;
    },

    removeOwnAvailabilitySlotForDate: async (date, slot) => {
        const response = await axiosInstance.delete(
            "/doctor/availability/date/slot",
            {
                data: {
                    date,
                    slot,
                },
            },
        );
        return response.data;
    },
};
