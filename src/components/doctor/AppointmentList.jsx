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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
                            <div className="flex-shrink-0">
                                {apt.patient?.profilePhoto ? (
                                    <img
                                        src={apt.patient.profilePhoto}
                                        alt=""
                                        className="w-11 h-11 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-[#065A82]/10 flex items-center justify-center">
                                        <User
                                            size={20}
                                            className="text-[#065A82]"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 truncate">
                                        {apt.patient?.name || "Patient"}
                                    </span>
                                    {apt.isEmergency && (
                                        <AlertTriangle
                                            size={14}
                                            className="text-red-500 flex-shrink-0"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
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

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge
                                    variant={
                                        apt.urgencyLevel === "emergency"
                                            ? "emergency"
                                            : apt.status
                                    }
                                >
                                    {apt.urgencyLevel === "emergency"
                                        ? "Emergency"
                                        : undefined}
                                </Badge>
                                <ChevronRight
                                    size={16}
                                    className="text-gray-400"
                                />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export { AppointmentList };
