import { useState, useEffect } from "react";
import {
    ShieldAlert,
    Users,
    RefreshCw,
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Timer,
    Siren,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
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
    const [insights, setInsights] = useState(null);
    const [selectedQueueType, setSelectedQueueType] = useState("ayurveda");
    const [selectedNormalIds, setSelectedNormalIds] = useState([]);
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchReasonPreset, setBatchReasonPreset] =
        useState("Doctor unavailable");

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
            setSelectedNormalIds([]);
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

    const loadInsights = async () => {
        try {
            const result = await adminService.getQueueInsights();
            setInsights(result.data || null);
        } catch {
            setInsights(null);
        }
    };

    useEffect(() => {
        loadQueues();
        loadInsights();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadInsights();
        }, 10000);

        return () => clearInterval(intervalId);
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
            await Promise.all([loadQueues(), loadInsights()]);
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
            await Promise.all([loadQueues(), loadInsights()]);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to reject appointment securely.",
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const formatDuration = (seconds) => {
        const value = Math.max(0, Number(seconds) || 0);
        const h = Math.floor(value / 3600);
        const m = Math.floor((value % 3600) / 60);
        const s = value % 60;
        if (h > 0) {
            return `${h}h ${m}m ${s}s`;
        }
        return `${m}m ${s}s`;
    };

    const toggleNormalSelect = (id, checked) => {
        setSelectedNormalIds((prev) => {
            if (checked) {
                return [...new Set([...prev, id])];
            }
            return prev.filter((item) => item !== id);
        });
    };

    const toggleAllNormalSelect = (checked) => {
        if (!checked) {
            setSelectedNormalIds([]);
            return;
        }
        setSelectedNormalIds(
            normalQueue
                .map((item) => item._id || item.appointmentId)
                .filter(Boolean),
        );
    };

    const handleBatchDecision = async (action) => {
        if (selectedNormalIds.length === 0) {
            showErrorToast("Select at least one appointment for batch action.");
            return;
        }

        try {
            setBatchLoading(true);
            const payload = {
                appointmentIds: selectedNormalIds,
                action,
            };
            if (action === "reject") {
                payload.reasonPreset = batchReasonPreset;
            }

            const response = await adminService.batchDecision(payload);
            const successCount = Number(response.data?.successCount || 0);
            const failureCount = Number(response.data?.failureCount || 0);

            if (failureCount > 0) {
                showErrorToast(
                    `Batch ${action} completed with ${successCount} success and ${failureCount} failures.`,
                );
            } else {
                showSuccessToast(
                    `${successCount} appointments ${action === "approve" ? "approved" : "rejected"} successfully.`,
                );
            }

            await Promise.all([loadQueues(), loadInsights()]);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Batch action failed.",
            );
        } finally {
            setBatchLoading(false);
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
                        onClick={() => {
                            loadQueues();
                            loadInsights();
                        }}
                    >
                        Refresh Sync
                    </Button>
                }
            />

            {insights ? (
                (() => {
                    const currentInsights = insights[selectedQueueType] || insights.global || insights;
                    return (
                        <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            label="Avg Queue Wait"
                            value={formatDuration(
                                currentInsights.sla?.averageWaitSeconds,
                            )}
                            icon={Timer}
                            variant="info"
                        />
                        <StatCard
                            label="SLA Breaches"
                            value={currentInsights.sla?.breachCount ?? 0}
                            icon={Siren}
                            variant="warning"
                        />
                        <StatCard
                            label="Notifications Delivered"
                            value={`${currentInsights.notificationDelivery?.delivered ?? 0}/${currentInsights.notificationDelivery?.sent ?? 0}`}
                            icon={BarChart3}
                            variant="success"
                        />
                    </div>

                    {currentInsights.longestWaiting?.appointmentId ? (
                        <Card className="border-amber-200 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-900/10">
                            <CardContent className="pt-5 pb-5">
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Longest waiting patient alert
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                    {currentInsights.longestWaiting.patientName} with
                                    Dr. {currentInsights.longestWaiting.doctorName} is
                                    waiting for{" "}
                                    {formatDuration(
                                        currentInsights.longestWaiting
                                            .waitingForSeconds,
                                    )}{" "}
                                    ({currentInsights.longestWaiting.queueStatus}).
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}

                    <Card className="shadow-sm border-neutral-200 dark:border-dark-border">
                        <CardHeader>
                            <CardTitle>
                                Bottleneck Analytics (Doctor x Slot)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(currentInsights.bottlenecks || []).length === 0 ? (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    No bottlenecks detected right now.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b border-neutral-200 dark:border-dark-border">
                                                <th className="py-2 pr-3">
                                                    Doctor
                                                </th>
                                                <th className="py-2 pr-3">
                                                    Slot
                                                </th>
                                                <th className="py-2 pr-3">
                                                    Waiting/Called
                                                </th>
                                                <th className="py-2 pr-3">
                                                    Avg Wait
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(currentInsights.bottlenecks || []).map(
                                                (item) => (
                                                    <tr
                                                        key={`${item.doctorName}-${item.timeSlot}`}
                                                        className="border-b border-neutral-100 dark:border-dark-border"
                                                    >
                                                        <td className="py-2 pr-3">
                                                            Dr.{" "}
                                                            {item.doctorName}
                                                        </td>
                                                        <td className="py-2 pr-3">
                                                            {item.timeSlot}
                                                        </td>
                                                        <td className="py-2 pr-3 font-semibold">
                                                            {
                                                                item.waitingOrCalled
                                                            }
                                                        </td>
                                                        <td className="py-2 pr-3">
                                                            {formatDuration(
                                                                item.avgWaitSeconds,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                        </>
                    );
                })()
            ) : null}

            <TodayQueue 
                externalQueueType={selectedQueueType}
                onQueueTypeChange={setSelectedQueueType}
            />

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
                    {normalQueue.length > 0 ? (
                        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-elevated/40 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                            <div className="text-sm text-neutral-600 dark:text-neutral-300">
                                {selectedNormalIds.length} selected
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <select
                                    className="h-10 px-3 border border-neutral-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-sm"
                                    value={batchReasonPreset}
                                    onChange={(e) =>
                                        setBatchReasonPreset(e.target.value)
                                    }
                                >
                                    <option>Doctor unavailable</option>
                                    <option>Duplicate booking detected</option>
                                    <option>Invalid patient details</option>
                                    <option>Slot unavailable</option>
                                    <option>Clinical triage mismatch</option>
                                </select>
                                <Button
                                    size="sm"
                                    variant="success"
                                    disabled={
                                        batchLoading ||
                                        selectedNormalIds.length === 0
                                    }
                                    onClick={() =>
                                        handleBatchDecision("approve")
                                    }
                                >
                                    Batch Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    disabled={
                                        batchLoading ||
                                        selectedNormalIds.length === 0
                                    }
                                    onClick={() =>
                                        handleBatchDecision("reject")
                                    }
                                >
                                    Batch Reject
                                </Button>
                            </div>
                        </div>
                    ) : null}
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
                            selectedIds={selectedNormalIds}
                            onToggleSelect={toggleNormalSelect}
                            onToggleSelectAll={toggleAllNormalSelect}
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
