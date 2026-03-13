import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { TimeSlotPicker } from "../../components/patient/TimeSlotPicker";
import { adminService } from "../../services/adminService";
import { patientService } from "../../services/patientService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/toastMessageHelper";
import { UserPlus, Stethoscope } from "lucide-react";

const OfflineBookingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientEmail: "",
    doctorId: "",
    date: "",
    timeSlot: "",
    symptoms: "",
    urgencyLevel: "normal",
    adminNotes: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const result = await patientService.getDoctors("");
      setDoctors(result.data?.doctors || []);
    } catch {
      showErrorToast("Failed to load doctors");
    }
  };

  const loadSlots = async (doctorId, date) => {
    try {
      setSlotsLoading(true);
      const result = await patientService.getAvailableSlots(doctorId, date);
      setAvailableSlots(result.data?.availableSlots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (form.doctorId && form.date) {
      loadSlots(form.doctorId, form.date);
      setForm((f) => ({ ...f, timeSlot: "" }));
    }
  }, [form.doctorId, form.date]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        patientEmail: form.patientEmail,
        doctorId: form.doctorId,
        date: form.date,
        timeSlot: form.timeSlot,
        urgencyLevel: form.urgencyLevel,
      };
      if (form.symptoms.trim()) {
        payload.symptoms = form.symptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (form.adminNotes.trim()) {
        payload.adminNotes = form.adminNotes;
      }
      const result = await adminService.offlineBookAppointment(payload);
      showSuccessToast("Walk-in appointment booked and confirmed!");
      setBooked(result.data);
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to book appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  if (booked) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Card className="text-center py-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Appointment Confirmed!
          </h2>
          <div className="text-sm text-gray-600 space-y-1 mb-6">
            <p>Patient: {booked.patient?.name || booked.patientEmail}</p>
            <p>Doctor: {booked.doctor?.name}</p>
            <p>Specialization: {booked.specialization}</p>
            <p>Date: {new Date(booked.date).toLocaleDateString()}</p>
            <p>Time: {booked.timeSlot}</p>
          </div>
          <Button
            onClick={() => {
              setBooked(null);
              setForm({
                patientEmail: "",
                doctorId: "",
                date: "",
                timeSlot: "",
                symptoms: "",
                urgencyLevel: "normal",
                adminNotes: "",
              });
            }}
          >
            Book Another
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={20} className="text-[#065A82]" />
            Offline Booking (Walk-in)
          </CardTitle>
        </CardHeader>

        <p className="text-sm text-gray-500 mb-6">
          Book an appointment for walk-in patients. This will skip the chat and
          auto-confirm the appointment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Patient Email"
            name="patientEmail"
            type="email"
            value={form.patientEmail}
            onChange={handleChange}
            placeholder="patient@example.com"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Doctor <span className="text-red-500">*</span>
            </label>
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doc) => (
                <option
                  key={doc.doctorId || doc._id}
                  value={doc.doctorId || doc._id}
                >
                  Dr. {doc.name} — {doc.specialization}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            min={getMinDate()}
            required
          />

          {form.doctorId && form.date && (
            <TimeSlotPicker
              slots={availableSlots}
              selected={form.timeSlot}
              onSelect={(slot) => setForm({ ...form, timeSlot: slot })}
              loading={slotsLoading}
            />
          )}

          <Input
            label="Symptoms (comma-separated, optional)"
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            placeholder="headache, fever, cough"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Urgency Level
            </label>
            <select
              name="urgencyLevel"
              value={form.urgencyLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
            >
              <option value="normal">Normal</option>
              <option value="emergency">Emergency 🚨</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Admin Notes (optional)
            </label>
            <textarea
              name="adminNotes"
              value={form.adminNotes}
              onChange={handleChange}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!form.timeSlot}
          >
            Book & Confirm Appointment
          </Button>
        </form>
      </Card>
    </div>
  );
};

export { OfflineBookingPage };
