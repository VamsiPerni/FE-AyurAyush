import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Calendar, Clock, Hash, Stethoscope, Users } from "lucide-react";

const AppointmentCard = ({ appointment, onView, onCancel, loading }) => {
    const {
        _id,
        appointmentId,
        status,
        urgencyLevel,
        date,
        timeSlot,
        doctor,
        tokenNumber,
        queueAheadCount,
        queueType,
        queueStatus,
        queueNotificationMessage,
        lastCalledAt,
        symptoms,
        aiSummary,
    } = appointment;

    const id = appointmentId || _id;
    const shouldShowQueueInfo = status === "confirmed";

    const formatDate = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <Card
            hover
            className="flex flex-col gap-3"
            urgent={urgencyLevel === "emergency"}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Stethoscope className="w-4.5 h-4.5 text-info-600" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {doctor?.name || "Doctor"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {urgencyLevel === "emergency" && (
                        <Badge type="status" value="emergency">
                            Emergency
                        </Badge>
                    )}
                    <Badge type="status" value={status}>
                        {status === "pending_admin_approval"
                            ? "Pending Approval"
                            : status}
                    </Badge>
                </div>
            </div>

            {doctor?.specialization && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {doctor.specialization}
                </p>
            )}

            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(date)}
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeSlot}
                </span>
            </div>

            {shouldShowQueueInfo &&
                (tokenNumber || queueAheadCount !== null) && (
                    <div className="bg-primary-50 dark:bg-primary-900/15 rounded-xl px-3 py-2.5 flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                        <span className="text-sm font-bold text-primary-700 dark:text-primary-300 font-mono">
                            {tokenNumber || "-"}
                        </span>
                        <span className="text-xs text-primary-700/80 dark:text-primary-400/80 ml-1 inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {queueAheadCount !== null
                                ? `${queueAheadCount} ahead`
                                : "Queue updating"}
                        </span>
                        {queueType && (
                            <Badge
                                type="queue"
                                value={queueType}
                                className="ml-auto"
                            />
                        )}
                    </div>
                )}

            {(queueStatus === "called" ||
                queueStatus === "in_consultation") && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700/50 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {queueNotificationMessage ||
                            "It is your turn. Please proceed to consultation area."}
                    </p>
                    {lastCalledAt && (
                        <p className="text-[11px] text-blue-600 mt-1">
                            Last notified at{" "}
                            {new Date(lastCalledAt).toLocaleTimeString(
                                "en-IN",
                                { hour: "2-digit", minute: "2-digit" },
                            )}
                        </p>
                    )}
                </div>
            )}

            {(symptoms?.length > 0 || aiSummary?.symptoms?.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                    {(symptoms || aiSummary?.symptoms || [])
                        .slice(0, 3)
                        .map((s, i) => (
                            <span
                                key={i}
                                className="text-xs bg-neutral-100 dark:bg-dark-elevated text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-md"
                            >
                                {s}
                            </span>
                        ))}
                </div>
            )}

            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-neutral-100 dark:border-dark-border">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onView?.(id)}
                >
                    View Details
                </Button>
                {(status === "pending_admin_approval" ||
                    status === "confirmed") && (
                    <Button
                        size="sm"
                        variant="danger"
                        loading={loading}
                        onClick={() => onCancel?.(id)}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </Card>
    );
};

export { AppointmentCard };
export default AppointmentCard;
