import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { Clock, AlertTriangle, User, CalendarCheck } from "lucide-react";

const TodaySchedule = ({ appointments = [], onSelect, loading }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-neutral-100 dark:bg-dark-elevated rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="w-4.5 h-4.5 text-primary-600" />
                    Today's Schedule
                </CardTitle>
                <Badge type="status" value="info">
                    {appointments.length} appointments
                </Badge>
            </CardHeader>

            {appointments.length === 0 ? (
                <EmptyState
                    icon="calendar"
                    title="No appointments today"
                    description="Your schedule is clear for today"
                />
            ) : (
                <div className="space-y-2">
                    {appointments.map((apt) => {
                        const id = apt.appointmentId || apt._id;
                        return (
                            <div
                                key={id}
                                onClick={() => onSelect?.(id)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                    apt.isEmergency ||
                                    apt.urgencyLevel === "emergency"
                                        ? "bg-error-50 dark:bg-error-900/10 border-error-300 dark:border-error-700/50 hover:bg-red-100 dark:hover:bg-error-900/20"
                                        : "bg-neutral-50 dark:bg-dark-elevated border-neutral-200 dark:border-dark-border hover:bg-primary-50/40 dark:hover:bg-primary-900/10"
                                }`}
                            >
                                <div className="shrink-0">
                                    {apt.patient?.profilePhoto ? (
                                        <img
                                            src={apt.patient.profilePhoto}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                            <User className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-neutral-800 dark:text-neutral-100 text-sm truncate">
                                        {apt.patient?.name || "Patient"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{apt.timeSlot}</span>
                                        {apt.slotBookingCount != null && (
                                            <span className={`px-1.5 py-0.5 rounded font-semibold ${
                                                apt.slotBookingCount >= (apt.slotCapacity || 2)
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                            }`}>
                                                {apt.slotBookingCount}/{apt.slotCapacity || 2}
                                            </span>
                                        )}
                                        {(apt.symptoms ||
                                            apt.aiSummary?.symptoms) && (
                                            <span className="truncate">
                                                •{" "}
                                                {(
                                                    apt.symptoms ||
                                                    apt.aiSummary?.symptoms ||
                                                    []
                                                )
                                                    .slice(0, 2)
                                                    .join(", ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {(apt.isEmergency ||
                                    apt.urgencyLevel === "emergency") && (
                                    <AlertTriangle className="w-4 h-4 text-error-600 shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export { TodaySchedule };
export default TodaySchedule;
