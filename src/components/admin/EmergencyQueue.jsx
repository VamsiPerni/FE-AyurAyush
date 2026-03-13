import { useState, useEffect } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { AppointmentApprovalCard } from "./AppointmentApprovalCard";
import { adminService } from "../../services/adminService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/toastMessageHelper";
import { AlertTriangle, RefreshCw } from "lucide-react";

const EmergencyQueue = ({ onRefresh }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await adminService.getEmergencyAppointments();
      setAppointments(result.data?.appointments || []);
    } catch {
      showErrorToast("Failed to load emergency queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (appointmentId, data) => {
    try {
      await adminService.approveAppointment(appointmentId, data);
      showSuccessToast("Emergency appointment approved!");
      setAppointments((prev) =>
        prev.filter((a) => (a.appointmentId || a._id) !== appointmentId),
      );
      onRefresh?.();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (appointmentId, reason) => {
    try {
      await adminService.rejectAppointment(appointmentId, reason);
      showSuccessToast("Appointment rejected");
      setAppointments((prev) =>
        prev.filter((a) => (a.appointmentId || a._id) !== appointmentId),
      );
      onRefresh?.();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          <h2 className="text-lg font-bold text-red-800">🚨 Emergency Queue</h2>
          <Badge variant="emergency" className="ml-2">
            {appointments.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw size={14} />
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No emergency appointments"
          description="All clear!"
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <AppointmentApprovalCard
              key={apt.appointmentId || apt._id}
              appointment={apt}
              isEmergency
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { EmergencyQueue };
