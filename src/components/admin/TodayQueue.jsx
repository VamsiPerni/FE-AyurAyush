import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const TodayQueue = () => {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [callingId, setCallingId] = useState(null);
    const [nowTick, setNowTick] = useState(Date.now());

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

            {loading ? (
                <LoadingSkeleton type="table" count={3} />
            ) : appointments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                    No queue appointments for today.
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
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">Call Count</th>
                                <th className="py-2 pr-3">Consultation</th>
                                <th className="py-2 pr-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt) => {
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
                                        <td className="py-2 pr-3 font-mono text-xs text-gray-700 dark:text-neutral-300">
                                            {resolveConsultationDuration(apt)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <Button
                                                size="sm"
                                                onClick={() => handleCall(id)}
                                                loading={callingId === id}
                                                disabled={
                                                    apt.queueStatus ===
                                                        "completed" ||
                                                    apt.status === "completed"
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
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export { TodayQueue };
export default TodayQueue;
