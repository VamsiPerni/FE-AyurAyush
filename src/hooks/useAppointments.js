import { useState, useCallback } from "react";
import { patientService } from "../services/patientService";
import { doctorService } from "../services/doctorService";
import { adminService } from "../services/adminService";
import { showErrorToast, showSuccessToast } from "../utils/toastMessageHelper";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Patient
  const fetchPatientAppointments = useCallback(async (status = "") => {
    try {
      setLoading(true);
      const result = await patientService.getAppointments(status);
      setAppointments(result.data?.appointments || []);
      return result;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch appointments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAppointmentDetails = useCallback(async (id, role = "patient") => {
    try {
      setLoading(true);
      const service = role === "doctor" ? doctorService : patientService;
      const result = await service.getAppointmentDetails(id);
      setAppointment(result.data);
      return result.data;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch appointment details",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async (doctorId, date) => {
    try {
      setSlotsLoading(true);
      const result = await patientService.getAvailableSlots(doctorId, date);
      setAvailableSlots(result.data?.availableSlots || []);
      return result.data;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch available slots",
      );
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const bookAppointment = async (data) => {
    try {
      setLoading(true);
      const result = await patientService.bookAppointment(data);
      showSuccessToast("Appointment booked! Waiting for admin approval.");
      return result;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to book appointment",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      setLoading(true);
      await patientService.cancelAppointment(id);
      showSuccessToast("Appointment cancelled.");
      setAppointments((prev) =>
        prev.filter((a) => a._id !== id && a.appointmentId !== id),
      );
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to cancel appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  // Doctor
  const fetchDoctorAppointments = useCallback(
    async (status = "", date = "") => {
      try {
        setLoading(true);
        const result = await doctorService.getAppointments(status, date);
        return result.data;
      } catch (err) {
        showErrorToast(
          err.response?.data?.message || "Failed to fetch appointments",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchTodayAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await doctorService.getTodayAppointments();
      return result.data;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch today's appointments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAppointment = async (id, data) => {
    try {
      setLoading(true);
      const result = await doctorService.completeAppointment(id, data);
      showSuccessToast("Appointment marked as completed!");
      return result;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to complete appointment",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin
  const fetchPendingAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminService.getPendingAppointments();
      return result.data;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch pending appointments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmergencyAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminService.getEmergencyAppointments();
      return result.data;
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch emergency appointments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAppointment = async (id, data = {}) => {
    try {
      setLoading(true);
      const result = await adminService.approveAppointment(id, data);
      showSuccessToast("Appointment approved!");
      return result;
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to approve");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectAppointment = async (id, reason) => {
    try {
      setLoading(true);
      const result = await adminService.rejectAppointment(id, reason);
      showSuccessToast("Appointment rejected.");
      return result;
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to reject");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    appointment,
    availableSlots,
    loading,
    slotsLoading,
    fetchPatientAppointments,
    fetchAppointmentDetails,
    fetchAvailableSlots,
    bookAppointment,
    cancelAppointment,
    fetchDoctorAppointments,
    fetchTodayAppointments,
    completeAppointment,
    fetchPendingAppointments,
    fetchEmergencyAppointments,
    approveAppointment,
    rejectAppointment,
  };
};
