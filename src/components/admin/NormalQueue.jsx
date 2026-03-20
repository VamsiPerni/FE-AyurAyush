import { useState, useEffect } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { AppointmentApprovalCard } from "./AppointmentApprovalCard";
import { adminService } from "../../services/adminService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import { ClipboardList, RefreshCw } from "lucide-react";

const NormalQueue = ({ onRefresh }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await adminService.getPendingAppointments();
            setAppointments(result.data?.appointments || []);
        } catch {
            showErrorToast("Failed to load normal queue");
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
            showSuccessToast("Appointment approved!");
            setAppointments((prev) =>
                prev.filter(
                    (a) => (a.appointmentId || a._id) !== appointmentId,
                ),
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
                prev.filter(
                    (a) => (a.appointmentId || a._id) !== appointmentId,
                ),
            );
            onRefresh?.();
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to reject");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ClipboardList size={20} className="text-[#065A82]" />
                    <h2 className="text-lg font-bold text-gray-800">
                        📋 Normal Queue
                    </h2>
                    <Badge variant="info" className="ml-2">
                        {appointments.length}
                    </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchData}>
                    <RefreshCw size={14} />
                </Button>
            </div>

            {loading ? (
                <LoadingSkeleton type="card" count={3} />
            ) : appointments.length === 0 ? (
                <EmptyState
                    icon="inbox"
                    title="No pending appointments"
                    description="All appointments have been processed"
                />
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <AppointmentApprovalCard
                            key={apt.appointmentId || apt._id}
                            appointment={apt}
                            isEmergency={false}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { NormalQueue };
