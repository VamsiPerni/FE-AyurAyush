import { useState, useEffect } from "react";
import {
    ShieldAlert,
    Users,
    RefreshCw,
    AlertCircle,
    AlertTriangle,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/shared/PageHeader";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Textarea";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { EmergencyQueueCard } from "../../components/admin/EmergencyQueueCard";
import { NormalQueueTable } from "../../components/admin/NormalQueueTable";
import { EditAppointmentModal } from "../../components/admin/EditAppointmentModal";
import { TodayQueue } from "../../components/admin/TodayQueue";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const AppointmentQueuesPage = () => {
    const [emergencyQueue, setEmergencyQueue] = useState([]);
    const [normalQueue, setNormalQueue] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Reject Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [isApprovingWithEdits, setIsApprovingWithEdits] = useState(false);

    const loadQueues = async () => {
        try {
            setLoading(true);
            setError("");

            const [emRes, normRes] = await Promise.all([
                adminService.getEmergencyAppointments(),
                adminService.getPendingAppointments(),
            ]);

            const extractAppointments = (res) => {
                const payload = res?.data?.appointments
                    ? res.data
                    : res?.data?.data?.appointments
                      ? res.data.data
                      : res?.appointments
                        ? res
                        : {};

                const list = Array.isArray(payload.appointments)
                    ? payload.appointments
                    : Array.isArray(res)
                      ? res
                      : [];

                return list.map((apt) => {
                    const patientName =
                        apt?.patient?.name ||
                        apt?.patientName ||
                        apt?.patientId?.name ||
                        apt?.appointmentDetails?.patientName ||
                        "Unknown";

                    const doctorName =
                        apt?.doctor?.name ||
                        apt?.doctorName ||
                        apt?.doctorId?.name ||
                        apt?.appointmentDetails?.doctorName ||
                        "Unassigned";

                    return {
                        ...apt,
                        status:
                            apt?.status ||
                            apt?.appointmentDetails?.status ||
                            "pending_admin_approval",
                        urgencyLevel:
                            apt?.urgencyLevel ||
                            apt?.appointmentDetails?.urgencyLevel ||
                            "normal",
                        date:
                            apt?.date || apt?.appointmentDetails?.date || null,
                        timeSlot:
                            apt?.timeSlot ||
                            apt?.appointmentDetails?.timeSlot ||
                            "",
                        patient: {
                            ...(apt?.patient || {}),
                            name: patientName,
                        },
                        doctor: {
                            ...(apt?.doctor || {}),
                            name: doctorName,
                        },
                        patientName,
                        doctorName,
                    };
                });
            };

            setEmergencyQueue(extractAppointments(emRes));
            setNormalQueue(extractAppointments(normRes));
        } catch (err) {
            setEmergencyQueue([]);
            setNormalQueue([]);
            const message =
                err.response?.status === 403
                    ? "Admin access required. Please login with an admin account."
                    : "Failed to load appointment queues. Please check connection.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueues();
    }, []);

    const openEditApproveModal = (appointment) => {
        setEditingAppointment(appointment);
        setEditModalOpen(true);
    };

    const handleApproveWithEdits = async (payload) => {
        if (!editingAppointment) return;

        try {
            setIsApprovingWithEdits(true);
            const id =
                editingAppointment._id || editingAppointment.appointmentId;
            await adminService.approveAppointment(id, payload);
            showSuccessToast("Appointment approved successfully");
            setEditModalOpen(false);
            setEditingAppointment(null);
            loadQueues();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to approve appointment with changes.",
            );
        } finally {
            setIsApprovingWithEdits(false);
        }
    };

    const openRejectModal = (id) => {
        setRejectingId(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            showErrorToast(
                "A rejection reason is highly critical for compliance.",
            );
            return;
        }

        try {
            setIsRejecting(true);
            await adminService.rejectAppointment(rejectingId, rejectReason);
            showSuccessToast(
                "Appointment efficiently rejected and logs updated.",
            );
            setRejectModalOpen(false);
            loadQueues();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to reject appointment securely.",
            );
        } finally {
            setIsRejecting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 pb-8">
                <PageHeader
                    title="Appointment Queues"
                    subtitle="Reviewing triage flows actively..."
                />
                <Card className="p-6 border-red-100 dark:border-red-900/30 bg-red-50/10 dark:bg-red-900/5">
                    <TableSkeleton rows={2} columns={3} />
                </Card>
                <Card className="p-6">
                    <TableSkeleton rows={6} columns={5} />
                </Card>
            </div>
        );
    }

    if (error && emergencyQueue.length === 0 && normalQueue.length === 0) {
        return (
            <div className="max-w-6xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="System Connection Error"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadQueues}>
                            Retry Fetch
                        </Button>
                    }
                />
            </div>
        );
    }

    const queueTotal = emergencyQueue.length + normalQueue.length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title="Appointment Queues"
                subtitle={`Real-time Triage: ${queueTotal} Appointments pending your review.`}
                action={
                    <Button
                        variant="outline"
                        icon={RefreshCw}
                        onClick={loadQueues}
                    >
                        Refresh Sync
                    </Button>
                }
            />

            <TodayQueue />

            {/* EMERGENCY QUEUE */}
            <Card className="border-red-200 dark:border-red-700/40 shadow-md shadow-red-100/30 dark:shadow-none overflow-hidden">
                <CardHeader className="bg-red-50/80 dark:bg-red-900/10 border-b border-red-100 dark:border-red-700/40 flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-red-900 dark:text-red-300 tracking-tight">
                            Emergency Queue
                        </CardTitle>
                    </div>
                    <Badge
                        type="status"
                        value="emergency"
                        className="shadow-xs font-bold ring-1 ring-red-300"
                    >
                        {emergencyQueue.length} Priority Un-Checked
                    </Badge>
                </CardHeader>
                <CardContent
                    className={
                        emergencyQueue.length > 0
                            ? "p-4 sm:p-6 bg-red-50/10"
                            : "p-0"
                    }
                >
                    {emergencyQueue.length === 0 ? (
                        <div className="py-12 bg-white dark:bg-dark-card flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-success-50 text-success-500 rounded-full flex items-center justify-center mb-4 border border-success-100">
                                <ShieldAlert className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                                No active emergencies
                            </h3>
                            <p className="text-neutral-500 text-sm">
                                Crisis triage is clear right now. Good work.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {emergencyQueue.map((apt) => (
                                <EmergencyQueueCard
                                    key={apt._id || apt.appointmentId}
                                    appointment={apt}
                                    onEditApprove={openEditApproveModal}
                                    onReject={openRejectModal}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* NORMAL QUEUE */}
            <Card className="shadow-sm border-neutral-200 dark:border-dark-border">
                <CardHeader className="bg-neutral-50/50 dark:bg-dark-elevated/50 border-b border-neutral-100 dark:border-dark-border flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-600" />
                        <CardTitle className="text-neutral-800">
                            Standard Check-Ins
                        </CardTitle>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold border border-primary-200 dark:border-primary-700/40">
                        {normalQueue.length} Awaiting Approval
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {normalQueue.length === 0 ? (
                        <div className="py-20">
                            <EmptyState
                                icon={AlertTriangle}
                                title="Normal Queue Cleared"
                                description="There are currently no standard appointments pending your direct review."
                            />
                        </div>
                    ) : (
                        <NormalQueueTable
                            appointments={normalQueue}
                            onEditApprove={openEditApproveModal}
                            onReject={openRejectModal}
                        />
                    )}
                </CardContent>
            </Card>

            <EditAppointmentModal
                isOpen={editModalOpen}
                onClose={() => {
                    if (isApprovingWithEdits) return;
                    setEditModalOpen(false);
                    setEditingAppointment(null);
                }}
                appointment={editingAppointment}
                onSave={handleApproveWithEdits}
            />

            {/* Reject Reason Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => !isRejecting && setRejectModalOpen(false)}
                title="Provide Rejection Reason"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Please explicitly dictate clinical or standard
                        justification restricting the patient from progressing
                        via verification processes naturally.
                    </p>
                    <Textarea
                        placeholder="E.g., Doctor is unavailable today, Invalid check-in credentials..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        disabled={isRejecting}
                        required
                        rows={4}
                    />
                    <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-dark-border mt-6 pb-1">
                        <Button
                            variant="outline"
                            onClick={() => setRejectModalOpen(false)}
                            disabled={isRejecting}
                            className="flex-1"
                        >
                            Cancel Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleRejectSubmit}
                            loading={isRejecting}
                            className="flex-1"
                        >
                            Confirm Rejection
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export { AppointmentQueuesPage };
export default AppointmentQueuesPage;
