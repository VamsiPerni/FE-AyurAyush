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
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
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
          <CalendarCheck size={18} className="text-[#065A82]" />
          Today's Schedule
        </CardTitle>
        <Badge variant="info">{appointments.length} appointments</Badge>
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
                  apt.isEmergency || apt.urgencyLevel === "emergency"
                    ? "bg-red-50 border-red-200 hover:bg-red-100"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex-shrink-0">
                  {apt.patient?.profilePhoto ? (
                    <img
                      src={apt.patient.profilePhoto}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#065A82]/10 flex items-center justify-center">
                      <User size={18} className="text-[#065A82]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {apt.patient?.name || "Patient"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={11} />
                    <span>{apt.timeSlot}</span>
                    {(apt.symptoms || apt.aiSummary?.symptoms) && (
                      <span className="truncate">
                        •{" "}
                        {(apt.symptoms || apt.aiSummary?.symptoms || [])
                          .slice(0, 2)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                {(apt.isEmergency || apt.urgencyLevel === "emergency") && (
                  <AlertTriangle
                    size={16}
                    className="text-red-500 flex-shrink-0"
                  />
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
