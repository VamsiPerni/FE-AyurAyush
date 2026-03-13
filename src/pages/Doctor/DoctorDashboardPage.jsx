import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { TodaySchedule } from "../../components/doctor/TodaySchedule";
import { doctorService } from "../../services/doctorService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import {
  CalendarCheck,
  Calendar,
  Users,
  Activity,
  Stethoscope,
} from "lucide-react";

const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await doctorService.getDashboard();
      setDashboard(result.data?.data || result.data);
    } catch {
      showErrorToast("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#065A82] to-[#1C7293] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Doctor Dashboard 🩺</h1>
        <p className="text-white/80 text-sm">
          Manage your appointments and patients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Appointments",
            value: stats.todayAppointments ?? 0,
            icon: CalendarCheck,
            color: "#065A82",
          },
          {
            label: "Total Appointments",
            value: stats.totalAppointments ?? 0,
            icon: Calendar,
            color: "#1C7293",
          },
          {
            label: "Total Patients",
            value: stats.totalPatients ?? 0,
            icon: Users,
            color: "#02C39A",
          },
          {
            label: "Completed",
            value: stats.completedAppointments ?? 0,
            icon: Activity,
            color: "#7C3AED",
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${s.color}15` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/doctor/today")}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#065A82] transition text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[#065A82]/10 flex items-center justify-center">
            <CalendarCheck size={22} className="text-[#065A82]" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Today's Schedule</p>
            <p className="text-sm text-gray-500">
              View and manage today's appointments
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/doctor/appointments")}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1C7293] transition text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[#1C7293]/10 flex items-center justify-center">
            <Stethoscope size={22} className="text-[#1C7293]" />
          </div>
          <div>
            <p className="font-medium text-gray-900">All Appointments</p>
            <p className="text-sm text-gray-500">Browse appointment history</p>
          </div>
        </button>
      </div>

      {/* Today's Schedule */}
      <TodaySchedule
        appointments={dashboard?.todayAppointments || []}
        onViewAppointment={(id) => navigate(`/doctor/appointments/${id}`)}
      />
    </div>
  );
};

export { DoctorDashboardPage };
