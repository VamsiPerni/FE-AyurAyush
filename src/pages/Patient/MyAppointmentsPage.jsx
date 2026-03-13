import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AppointmentCard } from "../../components/patient/AppointmentCard";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { patientService } from "../../services/patientService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/toastMessageHelper";
import { Calendar, Filter } from "lucide-react";

const STATUSES = [
  "",
  "pending_admin_approval",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];
const STATUS_LABELS = {
  "": "All",
  pending_admin_approval: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const MyAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const loadAppointments = async (status = "") => {
    try {
      setLoading(true);
      const result = await patientService.getAppointments(status);
      setAppointments(result.data?.appointments || []);
    } catch {
      showErrorToast("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(statusFilter);
  }, [statusFilter]);

  const handleCancel = async (id) => {
    try {
      setCancellingId(id);
      await patientService.cancelAppointment(id);
      showSuccessToast("Appointment cancelled");
      setAppointments((prev) =>
        prev.filter((a) => (a._id || a.appointmentId) !== id),
      );
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={24} className="text-[#065A82]" />
          My Appointments
        </h1>
        <Button onClick={() => navigate("/patient/chatbot")}>
          Book New Appointment
        </Button>
      </div>

      {/* Status Filter */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-[#065A82] text-white border-[#065A82]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7293]"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No appointments found"
          description="Start a consultation with our AI to book your first appointment"
          action={
            <Button onClick={() => navigate("/patient/chatbot")}>
              Start Consultation
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <AppointmentCard
              key={apt._id || apt.appointmentId}
              appointment={apt}
              onView={(id) => navigate(`/patient/appointments/${id}`)}
              onCancel={handleCancel}
              loading={cancellingId === (apt._id || apt.appointmentId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { MyAppointmentsPage };
