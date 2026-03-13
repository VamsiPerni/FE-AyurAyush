import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { patientService } from "../../services/patientService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import {
  MessageSquare,
  CalendarPlus,
  ClipboardList,
  UserPlus,
  Activity,
  Calendar,
  Clock,
  Stethoscope,
} from "lucide-react";

const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await patientService.getDashboard();
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
  const recentAppointments = dashboard?.recentAppointments || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#065A82] to-[#1C7293] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back! 👋</h1>
        <p className="text-white/80 text-sm">
          Manage your health journey with AyurAyush
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate("/patient/chatbot")}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#02C39A] transition group"
        >
          <div className="w-12 h-12 rounded-full bg-[#02C39A]/10 flex items-center justify-center group-hover:bg-[#02C39A]/20 transition">
            <MessageSquare size={22} className="text-[#02C39A]" />
          </div>
          <span className="text-sm font-medium text-gray-700">AI Chatbot</span>
        </button>

        <button
          onClick={() => navigate("/patient/book-appointment")}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#065A82] transition group"
        >
          <div className="w-12 h-12 rounded-full bg-[#065A82]/10 flex items-center justify-center group-hover:bg-[#065A82]/20 transition">
            <CalendarPlus size={22} className="text-[#065A82]" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Book Appointment
          </span>
        </button>

        <button
          onClick={() => navigate("/patient/appointments")}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1C7293] transition group"
        >
          <div className="w-12 h-12 rounded-full bg-[#1C7293]/10 flex items-center justify-center group-hover:bg-[#1C7293]/20 transition">
            <ClipboardList size={22} className="text-[#1C7293]" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            My Appointments
          </span>
        </button>

        <button
          onClick={() => navigate("/patient/apply-doctor-role")}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-500 transition group"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition">
            <UserPlus size={22} className="text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Become a Doctor
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Appointments",
            value: stats.totalAppointments ?? 0,
            icon: Calendar,
            color: "#065A82",
          },
          {
            label: "Upcoming",
            value: stats.upcomingAppointments ?? stats.upcoming ?? 0,
            icon: Clock,
            color: "#1C7293",
          },
          {
            label: "Completed",
            value: stats.completedAppointments ?? stats.completed ?? 0,
            icon: Activity,
            color: "#02C39A",
          },
          {
            label: "Consultations",
            value: stats.totalConsultations ?? stats.consultations ?? 0,
            icon: Stethoscope,
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

      {/* Recent Appointments */}
      {recentAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt._id || apt.appointmentId}
                  onClick={() =>
                    navigate(
                      `/patient/appointments/${apt._id || apt.appointmentId}`,
                    )
                  }
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope size={16} className="text-[#1C7293]" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {apt.doctor?.name || apt.doctorName || "Doctor"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.date).toLocaleDateString()} •{" "}
                        {apt.timeSlot}
                      </p>
                    </div>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { PatientDashboardPage };
