import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Clock, User, AlertTriangle, ChevronRight } from "lucide-react";

const AppointmentList = ({
    appointments = [],
    onSelect,
    title,
    emptyMessage = "No appointments found",
}) => {
    if (appointments.length === 0) {
        return <EmptyState icon="calendar" title={emptyMessage} />;
    }

    return (
        <div>
            {title && (
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                    {title}
                </h3>
            )}
            <div className="space-y-3">
                {appointments.map((apt) => {
                    const id = apt.appointmentId || apt._id;
                    return (
                        <Card
                            key={id}
                            hover
                            onClick={() => onSelect?.(id)}
                            className="flex items-center gap-4"
                        >
                            <div className="shrink-0">
                                {apt.patient?.profilePhoto ? (
                                    <img
                                        src={apt.patient.profilePhoto}
                                        alt=""
                                        className="w-11 h-11 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary-600" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-neutral-800 truncate">
                                        {apt.patient?.name || "Patient"}
                                    </span>
                                    {apt.isEmergency && (
                                        <AlertTriangle className="w-3.5 h-3.5 text-error-600 shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-neutral-500 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {apt.timeSlot ||
                                            apt.appointmentDetails?.timeSlot}
                                    </span>
                                    {(apt.symptoms?.length > 0 ||
                                        apt.appointmentDetails?.symptoms
                                            ?.length > 0) && (
                                        <span className="truncate">
                                            {(
                                                apt.symptoms ||
                                                apt.appointmentDetails
                                                    ?.symptoms ||
                                                []
                                            )
                                                .slice(0, 2)
                                                .join(", ")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                    type="status"
                                    value={
                                        apt.urgencyLevel === "emergency"
                                            ? "emergency"
                                            : apt.status
                                    }
                                >
                                    {apt.urgencyLevel === "emergency"
                                        ? "Emergency"
                                        : undefined}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export { AppointmentList };
export default AppointmentList;
