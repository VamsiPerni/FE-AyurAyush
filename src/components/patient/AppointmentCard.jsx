import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";

const AppointmentCard = ({ appointment, onView, onCancel, loading }) => {
    const {
        _id,
        appointmentId,
        status,
        urgencyLevel,
        date,
        timeSlot,
        doctor,
        symptoms,
        aiSummary,
    } = appointment;

    const id = appointmentId || _id;

    const formatDate = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <Card hover className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Stethoscope size={18} className="text-[#1C7293]" />
                    <span className="font-semibold text-gray-900">
                        {doctor?.name || "Doctor"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {urgencyLevel === "emergency" && (
                        <Badge variant="emergency">🚨 Emergency</Badge>
                    )}
                    <Badge variant={status}>
                        {status === "pending_admin_approval"
                            ? "Pending Approval"
                            : status}
                    </Badge>
                </div>
            </div>

            {doctor?.specialization && (
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(date)}
                </span>
                <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {timeSlot}
                </span>
            </div>

            {(symptoms?.length > 0 || aiSummary?.symptoms?.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                    {(symptoms || aiSummary?.symptoms || [])
                        .slice(0, 3)
                        .map((s, i) => (
                            <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                                {s}
                            </span>
                        ))}
                </div>
            )}

            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
                <Button
                    size="sm"
                    variant="outline"
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
