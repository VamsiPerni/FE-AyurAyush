import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { Modal } from "../ui/Modal";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const TodayQueue = ({ externalQueueType = "ayurveda", onQueueTypeChange }) => {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [callingId, setCallingId] = useState(null);
    const [nowTick, setNowTick] = useState(Date.now());
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditData, setAuditData] = useState(null);

    const formatDuration = (totalSeconds) => {
        const safe = Math.max(0, Number(totalSeconds) || 0);
        const h = Math.floor(safe / 3600);
        const m = Math.floor((safe % 3600) / 60);
        const s = safe % 60;
        if (h > 0) {
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const resolveConsultationDuration = (apt) => {
        if (
            apt.queueStatus === "in_consultation" &&
            apt.consultationStartedAt
        ) {
            const start = new Date(apt.consultationStartedAt).getTime();
            const end = apt.consultationEndedAt
                ? new Date(apt.consultationEndedAt).getTime()
                : nowTick;
            return formatDuration(
                Math.max(0, Math.floor((end - start) / 1000)),
            );
        }

        if (Number.isFinite(Number(apt.consultationDurationSeconds))) {
            return formatDuration(Number(apt.consultationDurationSeconds));
        }

        if (apt.consultationStartedAt) {
            const start = new Date(apt.consultationStartedAt).getTime();
            const end = apt.consultationEndedAt
                ? new Date(apt.consultationEndedAt).getTime()
                : nowTick;
            return formatDuration(
                Math.max(0, Math.floor((end - start) / 1000)),
            );
        }

        return "-";
    };

    const fetchQueue = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            const result = await adminService.getTodayQueue();
            setAppointments(result.data?.appointments || []);
        } catch {
            if (!silent) {
                showErrorToast("Failed to load today's queue");
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchQueue();

        const intervalId = setInterval(() => {
            fetchQueue({ silent: true });
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => {
            setNowTick(Date.now());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const handleCall = async (appointmentId) => {
        try {
            setCallingId(appointmentId);
            const result = await adminService.callPatient(appointmentId);
            const firstCall = result?.data?.firstCallEmailSent;
            showSuccessToast(
                firstCall
                    ? "Notification sent: email + in-app"
                    : "Reminder sent as in-app notification",
            );
            await fetchQueue({ silent: true });
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to call patient",
            );
        } finally {
            setCallingId(null);
        }
    };

    const handleOpenAudit = async (appointmentId) => {
        try {
            setAuditLoading(true);
            const result = await adminService.getAppointmentAuditTrail(
                appointmentId,
            );
            setAuditData(result.data || null);
            setAuditOpen(true);
        } catch {
            showErrorToast("Failed to load audit trail");
        } finally {
            setAuditLoading(false);
        }
    };

    const getDeliveryLabel = (apt) => {
        if (apt.deliveryStatus === "delivered") {
            return "Delivered";
        }
        if (apt.deliveryStatus === "failed") {
            return "Failed";
        }
        if ((apt.queueCallCount || 0) > 0) {
            return "Unknown";
        }
        return "Not Sent";
    };

    const getDeliveryClassName = (apt) => {
        const base = "inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold";
        if (apt.deliveryStatus === "delivered") {
            return `${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300`;
        }
        if (apt.deliveryStatus === "failed") {
            return `${base} bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300`;
        }
        if ((apt.queueCallCount || 0) > 0) {
            return `${base} bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300`;
        }
        return `${base} bg-neutral-100 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300`;
        return `${base} bg-neutral-100 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300`;
    };

    const handleQueueTypeChange = (type) => {
        if (type !== externalQueueType) {
            if (onQueueTypeChange) onQueueTypeChange(type);
            setSelectedDoctorId("all");
            setStatusFilter("all");
        }
    };

    const parseSlotMinutes = (timeSlot) => {
        const start = String(timeSlot || "").split("-")[0].trim();
        const match = start.match(/^(\d{1,2}):(\d{2})/);
        if (!match) return 9999;
        return Number(match[1]) * 60 + Number(match[2]);
    };

    const filteredByQueueType = appointments.filter((apt) => (apt.queueType || "normal") === externalQueueType);

    const uniqueDoctors = [];
    const docSet = new Set();
    filteredByQueueType.forEach(apt => {
        const id = apt.doctor?.id;
        if (id && !docSet.has(id)) {
            docSet.add(id);
            uniqueDoctors.push({ id, name: apt.doctor?.name });
        }
    });

    const displayedAppointments = filteredByQueueType
        .filter(apt => selectedDoctorId === "all" || apt.doctor?.id === selectedDoctorId)
        .filter(apt => statusFilter === "all" || (apt.queueStatus || "waiting") === statusFilter)
        .sort((a, b) => {
            const slotDiff = parseSlotMinutes(a.timeSlot) - parseSlotMinutes(b.timeSlot);
            if (slotDiff !== 0) return slotDiff;
            return (a.tokenSequence ?? 9999) - (b.tokenSequence ?? 9999);
        });

    const QUEUE_TYPES = [
        { id: "ayurveda", label: "Ayurveda" },
        { id: "panchakarma", label: "Panchakarma" },
        { id: "normal", label: "Normal Care" }
    ];

    return (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-neutral-100">
                    Live Queue (Today)
                </h2>
                <Button variant="ghost" size="sm" onClick={fetchQueue}>
                    Refresh
                </Button>
            </div>

            <div className="flex border-b border-gray-200 dark:border-dark-border mb-4">
                {QUEUE_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleQueueTypeChange(type.id)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
                            externalQueueType === type.id
                                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {uniqueDoctors.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide mr-1">Doctors:</span>
                    <button
                        onClick={() => setSelectedDoctorId("all")}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            selectedDoctorId === "all"
                                ? "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-700/50"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-dark-card dark:border-dark-border dark:text-gray-300 dark:hover:bg-dark-elevated"
                        }`}
                    >
                        All Doctors
                    </button>
                    {uniqueDoctors.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDoctorId(doc.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                selectedDoctorId === doc.id
                                    ? "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-700/50"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-dark-card dark:border-dark-border dark:text-gray-300 dark:hover:bg-dark-elevated"
                            }`}
                        >
                            Dr. {doc.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide">Status:</span>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 px-3 rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-xs text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                    <option value="all">All Statuses</option>
                    <option value="waiting">Waiting</option>
                    <option value="called">Called</option>
                    <option value="in_consultation">In Consultation</option>
                    <option value="completed">Completed</option>
                </select>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {displayedAppointments.length} patient{displayedAppointments.length !== 1 ? "s" : ""}
                </span>
            </div>

            {loading ? (
                <LoadingSkeleton type="table" count={3} />
            ) : displayedAppointments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-neutral-400 p-4 text-center">
                    No appointments in queue for this category
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-neutral-400 border-b dark:border-dark-border">
                                <th className="py-2 pr-3">Token</th>
                                <th className="py-2 pr-3">Patient</th>
                                <th className="py-2 pr-3">Doctor</th>
                                <th className="py-2 pr-3">Time</th>
                                <th className="py-2 pr-3">Slot Fill</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">Call Count</th>
                                <th className="py-2 pr-3">Delivery</th>
                                <th className="py-2 pr-3">Consultation</th>
                                <th className="py-2 pr-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedAppointments.map((apt) => {
                                const id = apt.appointmentId || apt._id;
                                return (
                                    <tr
                                        key={id}
                                        className="border-b dark:border-dark-border last:border-0"
                                    >
                                        <td className="py-2 pr-3 font-medium">
                                            {apt.tokenNumber || "-"}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {apt.patient?.name}
                                        </td>
                                        <td className="py-2 pr-3">
                                            Dr. {apt.doctor?.name}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {apt.timeSlot}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {apt.slotBookingCount != null ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                    apt.slotBookingCount >= (apt.slotCapacity || 2)
                                                        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                                }`}>
                                                    {apt.slotBookingCount}/{apt.slotCapacity || 2}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <Badge
                                                type="status"
                                                value={
                                                    apt.queueStatus || "waiting"
                                                }
                                            />
                                        </td>
                                        <td className="py-2 pr-3 font-medium">
                                            {apt.queueCallCount || 0}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <span
                                                className={getDeliveryClassName(
                                                    apt,
                                                )}
                                            >
                                                {getDeliveryLabel(apt)}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-3 font-mono text-xs text-gray-700 dark:text-neutral-300">
                                            {resolveConsultationDuration(apt)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleCall(id)
                                                    }
                                                    loading={callingId === id}
                                                    disabled={
                                                        apt.queueStatus ===
                                                            "completed" ||
                                                        apt.status ===
                                                            "completed"
                                                    }
                                                >
                                                    {apt.queueStatus ===
                                                        "completed" ||
                                                    apt.status === "completed"
                                                        ? "Completed"
                                                        : apt.queueStatus ===
                                                                "called" ||
                                                            apt.queueStatus ===
                                                                "in_consultation"
                                                          ? "Notify Again"
                                                          : "Notify Patient"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleOpenAudit(id)
                                                    }
                                                    loading={
                                                        auditLoading &&
                                                        !auditOpen
                                                    }
                                                >
                                                    Timeline
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={auditOpen}
                onClose={() => setAuditOpen(false)}
                title="Queue Audit Timeline"
                size="lg"
            >
                {auditData ? (
                    <div className="space-y-4">
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                            <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                                {auditData.appointment?.patientName || "Patient"}
                            </p>
                            <p>
                                Dr. {auditData.appointment?.doctorName || "Doctor"} • {auditData.appointment?.timeSlot || "-"}
                            </p>
                            <p>
                                Token: {auditData.appointment?.tokenNumber || "-"} • Calls: {auditData.appointment?.queueCallCount || 0}
                            </p>
                        </div>
                        <div className="space-y-3">
                            {(auditData.timeline || []).length === 0 ? (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    No timeline events recorded yet.
                                </p>
                            ) : (
                                (auditData.timeline || []).map((item, index) => (
                                    <div
                                        key={`${item.at}-${item.event}-${index}`}
                                        className="border border-neutral-200 dark:border-dark-border rounded-lg p-3"
                                    >
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {new Date(item.at).toLocaleString("en-IN")}
                                        </p>
                                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 capitalize mt-1">
                                            {(item.event || "event").replaceAll("_", " ")}
                                        </p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                                            {item.fromStatus || "-"} → {item.toStatus || "-"}
                                        </p>
                                        {item.note ? (
                                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                                                {item.note}
                                            </p>
                                        ) : null}
                                    </div>
                                ))
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                                Notification Delivery
                            </p>
                            {(auditData.notifications || []).length === 0 ? (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    No notifications recorded yet.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {(auditData.notifications || []).map((item, index) => (
                                        <div
                                            key={`${item.sentAt || index}-${index}`}
                                            className="flex items-center justify-between border border-neutral-200 dark:border-dark-border rounded-lg px-3 py-2 text-xs"
                                        >
                                            <span className="text-neutral-700 dark:text-neutral-200">
                                                {(item.channel || "in_app_only").replaceAll("_", " ")}
                                            </span>
                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                {item.sentAt
                                                    ? new Date(item.sentAt).toLocaleString("en-IN")
                                                    : "-"}
                                            </span>
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                                {item.deliveryStatus || "unknown"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {auditLoading
                            ? "Loading timeline..."
                            : "No audit data available."}
                    </p>
                )}
            </Modal>
        </div>
    );
};

export { TodayQueue };
export default TodayQueue;
