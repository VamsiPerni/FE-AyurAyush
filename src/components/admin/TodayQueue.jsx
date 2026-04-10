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

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const result = await adminService.getTodayQueue();
            setAppointments(result.data?.appointments || []);
        } catch {
            showErrorToast("Failed to load today's queue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleCall = async (appointmentId) => {
        try {
            setCallingId(appointmentId);
            const result = await adminService.callPatient(appointmentId);
            const firstCall = result?.data?.firstCallEmailSent;
            showSuccessToast(
                firstCall
                    ? "Call sent: email + in-app notification"
                    : "Reminder sent as in-app notification",
            );
            await fetchQueue();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to call patient",
            );
        } finally {
            setCallingId(null);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                    Live Queue (Today)
                </h2>
                <Button variant="ghost" size="sm" onClick={fetchQueue}>
                    Refresh
                </Button>
            </div>

            {loading ? (
                <LoadingSkeleton type="table" count={3} />
            ) : appointments.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No confirmed appointments for today.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2 pr-3">Token</th>
                                <th className="py-2 pr-3">Patient</th>
                                <th className="py-2 pr-3">Doctor</th>
                                <th className="py-2 pr-3">Time</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt) => {
                                const id = apt.appointmentId || apt._id;
                                return (
                                    <tr
                                        key={id}
                                        className="border-b last:border-0"
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
                                        <td className="py-2 pr-3">
                                            <Button
                                                size="sm"
                                                onClick={() => handleCall(id)}
                                                loading={callingId === id}
                                            >
                                                {apt.queueStatus === "called" ||
                                                apt.queueStatus ===
                                                    "in_consultation"
                                                    ? "Notify Again"
                                                    : "Call Patient"}
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
