import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Clock, Hash, User } from "lucide-react";

const AppointmentRow = ({
    appointment,
    onView,
    onCall,
    onStartConsultation,
    actionLoadingId,
}) => {
    const {
        _id,
        appointmentId,
        patient,
        patientName,
        timeSlot,
        status,
        urgencyLevel,
        tokenNumber,
        queueStatus,
        queueCallCount,
    } = appointment;
    const id = _id || appointmentId;
    const name = patient?.name || patientName || "Patient";
    const isEmergency = urgencyLevel === "emergency";
    const canManageQueue = status === "confirmed";
    const hasQueueHandlers = Boolean(onCall) && Boolean(onStartConsultation);
    const canShowQueueActions = canManageQueue && hasQueueHandlers;
    const isRowLoading = actionLoadingId === id;
    const resolvedQueueStatus = queueStatus || "waiting";

    return (
        <div
            className={`
      p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 
      border-b border-neutral-100 dark:border-dark-border last:border-0 hover:bg-neutral-50 dark:hover:bg-dark-hover transition-colors
      ${isEmergency ? "bg-red-50/20 dark:bg-red-900/5" : ""}
    `}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                    <div
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isEmergency ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"}`}
                    >
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight">
                            {name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeSlot}</span>
                            {tokenNumber && (
                                <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-mono border border-primary-100 dark:border-primary-800/50">
                                    <Hash className="w-3 h-3" />
                                    {tokenNumber}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Badges */}
                <div className="flex sm:hidden items-center gap-2 ml-13">
                    {isEmergency && (
                        <Badge type="status" value="emergency">
                            Emergency
                        </Badge>
                    )}
                    <Badge type="status" value={status} />
                    {canManageQueue && (
                        <Badge type="queue" value={resolvedQueueStatus} />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end mt-2 sm:mt-0 flex-wrap">
                <div className="hidden sm:flex items-center gap-2">
                    {isEmergency && (
                        <Badge type="status" value="emergency">
                            Emergency
                        </Badge>
                    )}
                    <Badge type="status" value={status} />
                    {canManageQueue && (
                        <Badge type="queue" value={resolvedQueueStatus} />
                    )}
                </div>
                {canShowQueueActions && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            loading={isRowLoading}
                            onClick={() => onCall?.(id)}
                        >
                            {resolvedQueueStatus === "called" ||
                            resolvedQueueStatus === "in_consultation"
                                ? "Notify Again"
                                : "Notify"}
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            loading={isRowLoading}
                            onClick={() =>
                                onStartConsultation?.(id, appointment)
                            }
                        >
                            {resolvedQueueStatus === "in_consultation"
                                ? "Resume Consultation"
                                : "Start Consultation"}
                        </Button>
                    </div>
                )}
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onView?.(id)}
                >
                    View Details
                </Button>
            </div>
            {canManageQueue && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 w-full sm:w-auto">
                    Queue State:{" "}
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                        {resolvedQueueStatus.replace("_", " ")}
                    </span>{" "}
                    • Calls:{" "}
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                        {queueCallCount || 0}
                    </span>
                </p>
            )}
        </div>
    );
};

export { AppointmentRow };
export default AppointmentRow;
