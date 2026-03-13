import { axiosInstance } from "../axios/axiosInstance";

export const patientService = {
  getDashboard: async () => {
    const response = await axiosInstance.get("/patient/dashboard");
    return response.data;
  },

  applyDoctorRole: async (data) => {
    const response = await axiosInstance.post(
      "/patient/apply-doctor-role",
      data,
    );
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

  getAppointments: async (status = "") => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await axiosInstance.get(`/patient/appointments${query}`);
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
};
