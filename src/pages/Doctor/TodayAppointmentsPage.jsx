import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TodaySchedule } from "../../components/doctor/TodaySchedule";
import { AppointmentList } from "../../components/doctor/AppointmentList";
import { Badge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { Button } from "../../components/ui/Button";
import { doctorService } from "../../services/doctorService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import { Calendar, Clock, Filter } from "lucide-react";

const TodayAppointmentsPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodayAppointments();
    }, []);

    const loadTodayAppointments = async () => {
        try {
            setLoading(true);
            const result = await doctorService.getTodayAppointments();
            setData(result.data);
        } catch {
            showErrorToast("Failed to load today's appointments");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={24} className="text-[#065A82]" />
                    Today's Appointments
                </h1>
                <Badge variant="info">
                    {data?.date
                        ? new Date(data.date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "short",
                          })
                        : "Today"}
                </Badge>
            </div>

            {loading ? (
                <LoadingSkeleton type="table" count={5} />
            ) : (
                <AppointmentList
                    appointments={data?.appointments || []}
                    onSelect={(id) => navigate(`/doctor/appointments/${id}`)}
                    emptyMessage="No appointments scheduled for today"
                />
            )}
        </div>
    );
};

export { TodayAppointmentsPage };
