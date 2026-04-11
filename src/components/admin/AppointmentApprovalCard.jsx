import { useState } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { AISummaryViewer } from "../doctor/AISummaryViewer";
import { EditAppointmentModal } from "./EditAppointmentModal";
import {
    Calendar,
    Clock,
    User,
    AlertTriangle,
    Timer,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const AppointmentApprovalCard = ({
    appointment,
    isEmergency,
    onApprove,
    onReject,
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const id = appointment.appointmentId || appointment._id;
    const patient = appointment.patient;
    const doctor = appointment.doctor;
    const details = appointment.appointmentDetails || appointment;
    const summary = details.aiSummary;

    const handleApprove = async () => {
        setLoading(true);
        await onApprove(id, {});
        setLoading(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setLoading(true);
        await onReject(id, rejectReason);
        setLoading(false);
        setShowRejectForm(false);
    };

    const handleApproveWithEdits = async (edits) => {
        setLoading(true);
        await onApprove(id, edits);
        setLoading(false);
        setShowEditModal(false);
    };

    const formatDate = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <Card
                className={`${isEmergency ? "border-red-300 dark:border-red-700/50 bg-red-50/50 dark:bg-red-900/5" : ""}`}
            >
                {isEmergency && (
                    <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400 font-semibold text-sm">
                        <AlertTriangle size={16} />
                        🚨 URGENT — EMERGENCY
                    </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Patient info */}
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary-600/10 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                            <User size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-neutral-100">
                                {patient?.name || "Patient"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400">
                                {patient?.email}
                            </p>
                        </div>
                    </div>

                    {/* Appointment info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                            <User size={13} className="text-gray-400" />
                            Dr. {doctor?.name || "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-gray-400" />
                            {formatDate(details.date)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={13} className="text-gray-400" />
                            {details.timeSlot}
                        </span>
                        {appointment.waitingTime && (
                            <span className="flex items-center gap-1 text-amber-600">
                                <Timer size={13} />
                                {appointment.waitingTime}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            size="sm"
                            variant="success"
                            onClick={handleApprove}
                            loading={loading}
                        >
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowEditModal(true)}
                        >
                            Edit & Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setShowRejectForm(!showRejectForm)}
                        >
                            Reject
                        </Button>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover"
                        >
                            {showDetails ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Symptoms preview */}
                {details.symptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {details.symptoms.map((s, i) => (
                            <span
                                key={i}
                                className="bg-gray-100 dark:bg-dark-elevated text-gray-600 dark:text-neutral-300 px-2 py-0.5 rounded text-xs"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                {/* Reject form */}
                {showRejectForm && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700/40 rounded-xl">
                        <label className="text-sm font-medium text-red-800 dark:text-red-400 block mb-1">
                            Rejection Reason *
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            className="w-full px-3 py-2 border border-red-200 dark:border-red-700/40 bg-white dark:bg-dark-elevated rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700/50"
                            rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                                loading={loading}
                            >
                                Confirm Reject
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowRejectForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Expanded details */}
                {showDetails && summary && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                        <AISummaryViewer summary={summary} />
                    </div>
                )}
            </Card>

            <EditAppointmentModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                appointment={appointment}
                onSave={handleApproveWithEdits}
            />
        </>
    );
};

export { AppointmentApprovalCard };
