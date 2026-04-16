import { axiosInstance } from "../axios/axiosInstance";

export const adminService = {
    getDashboard: async () => {
        const response = await axiosInstance.get("/admin/dashboard");
        return response.data;
    },

    createDoctorAccount: async (data) => {
        const response = await axiosInstance.post(
            "/admin/doctors/create",
            data,
        );
        return response.data;
    },

    getDoctorApplications: async () => {
        const response = await axiosInstance.get("/admin/doctor-applications");
        return response.data;
    },

    approveDoctorApplication: async (applicationId) => {
        const response = await axiosInstance.post(
            `/admin/doctor-applications/${encodeURIComponent(applicationId)}/approve`,
        );
        return response.data;
    },

    rejectDoctorApplication: async (applicationId, reason = "") => {
        const response = await axiosInstance.post(
            `/admin/doctor-applications/${encodeURIComponent(applicationId)}/reject`,
            { reason },
        );
        return response.data;
    },

    getDoctors: async (specialization = "") => {
        const query = specialization
            ? `?specialization=${encodeURIComponent(specialization)}`
            : "";
        const response = await axiosInstance.get(`/admin/doctors${query}`);
        return response.data;
    },

    getDoctorAvailableSlots: async (doctorId, date) => {
        const response = await axiosInstance.get(
            `/admin/doctors/${encodeURIComponent(doctorId)}/available-slots?date=${encodeURIComponent(date)}`,
        );
        return response.data;
    },

    getPendingAppointments: async () => {
        const response = await axiosInstance.get("/admin/appointments/pending");
        return response.data;
    },

    getTodayQueue: async () => {
        const response = await axiosInstance.get(
            "/admin/appointments/today-queue",
        );
        return response.data;
    },

    callPatient: async (appointmentId) => {
        const response = await axiosInstance.post(
            `/admin/appointments/${encodeURIComponent(appointmentId)}/call`,
        );
        return response.data;
    },

    getQueueInsights: async () => {
        const response = await axiosInstance.get(
            "/admin/appointments/queue-insights",
        );
        return response.data;
    },

    getAppointmentAuditTrail: async (appointmentId) => {
        const response = await axiosInstance.get(
            `/admin/appointments/${encodeURIComponent(appointmentId)}/audit-trail`,
        );
        return response.data;
    },

    batchDecision: async (payload) => {
        const response = await axiosInstance.post(
            "/admin/appointments/batch-decision",
            payload,
        );
        return response.data;
    },

    getEmergencyAppointments: async () => {
        const response = await axiosInstance.get(
            "/admin/appointments/emergency",
        );
        return response.data;
    },

    approveAppointment: async (appointmentId, data = {}) => {
        const response = await axiosInstance.post(
            `/admin/appointments/${encodeURIComponent(appointmentId)}/approve`,
            data,
        );
        return response.data;
    },

    rejectAppointment: async (appointmentId, reason) => {
        const response = await axiosInstance.post(
            `/admin/appointments/${encodeURIComponent(appointmentId)}/reject`,
            { reason },
        );
        return response.data;
    },

    updateDoctorAvailability: async (doctorId, data) => {
        const response = await axiosInstance.put(
            `/admin/doctors/${encodeURIComponent(doctorId)}/availability`,
            data,
        );
        return response.data;
    },

    getDoctorAvailability: async (doctorId, date) => {
        const query = date ? `?date=${encodeURIComponent(date)}` : "";
        const response = await axiosInstance.get(
            `/admin/doctors/${encodeURIComponent(doctorId)}/availability${query}`,
        );
        return response.data;
    },

    setDoctorAvailabilityForDate: async (doctorId, payload) => {
        const response = await axiosInstance.put(
            `/admin/doctors/${encodeURIComponent(doctorId)}/availability/date`,
            payload,
        );
        return response.data;
    },

    addDoctorAvailabilitySlotForDate: async (doctorId, payload) => {
        const response = await axiosInstance.post(
            `/admin/doctors/${encodeURIComponent(doctorId)}/availability/date/slot`,
            payload,
        );
        return response.data;
    },

    removeDoctorAvailabilitySlotForDate: async (doctorId, payload) => {
        const response = await axiosInstance.delete(
            `/admin/doctors/${encodeURIComponent(doctorId)}/availability/date/slot`,
            {
                data: payload,
            },
        );
        return response.data;
    },

    offlineBookAppointment: async (data) => {
        const response = await axiosInstance.post(
            "/admin/appointments/offline-book",
            data,
        );
        return response.data;
    },

    getEmergencyDelays: async () => {
        const response = await axiosInstance.get("/admin/emergency-delays");
        return response.data;
    },
};
