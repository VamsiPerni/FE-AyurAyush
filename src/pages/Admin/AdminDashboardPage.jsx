import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { adminService } from "../../services/adminService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import {
    Users,
    Stethoscope,
    UserCheck,
    ClipboardList,
    AlertTriangle,
    CalendarPlus,
    Settings,
    UserPlus,
} from "lucide-react";

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const result = await adminService.getDashboard();
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
                <h1 className="text-2xl font-bold mb-1">Admin Dashboard ⚙️</h1>
                <p className="text-white/80 text-sm">
                    Hospital management overview
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Users",
                        value: stats.totalUsers ?? 0,
                        icon: Users,
                        color: "#065A82",
                    },
                    {
                        label: "Total Doctors",
                        value: stats.totalDoctors ?? 0,
                        icon: Stethoscope,
                        color: "#1C7293",
                    },
                    {
                        label: "Total Patients",
                        value: stats.totalPatients ?? 0,
                        icon: UserCheck,
                        color: "#02C39A",
                    },
                    {
                        label: "Pending Approvals",
                        value:
                            stats.pendingApprovals ??
                            stats.pendingAppointments ??
                            0,
                        icon: AlertTriangle,
                        color: "#DC2626",
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
                                <p className="text-2xl font-bold text-gray-900">
                                    {s.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {s.label}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    {
                        label: "Appointment Queues",
                        desc: "Review pending & emergency appointments",
                        icon: ClipboardList,
                        color: "#065A82",
                        path: "/admin/queues",
                    },
                    {
                        label: "Doctor Applications",
                        desc: "Review pending doctor applications",
                        icon: UserPlus,
                        color: "#1C7293",
                        path: "/admin/doctor-applications",
                    },
                    {
                        label: "Manage Doctors",
                        desc: "View & manage registered doctors",
                        icon: Stethoscope,
                        color: "#02C39A",
                        path: "/admin/doctors",
                    },
                    {
                        label: "Doctor Availability",
                        desc: "Configure doctor schedules",
                        icon: Settings,
                        color: "#7C3AED",
                        path: "/admin/doctors",
                    },
                    {
                        label: "Offline Booking",
                        desc: "Book walk-in patient appointments",
                        icon: CalendarPlus,
                        color: "#DC2626",
                        path: "/admin/offline-booking",
                    },
                ].map((link) => (
                    <button
                        key={link.label}
                        onClick={() => navigate(link.path)}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-left"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${link.color}15` }}
                        >
                            <link.icon
                                size={22}
                                style={{ color: link.color }}
                            />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {link.label}
                            </p>
                            <p className="text-sm text-gray-500">{link.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export { AdminDashboardPage };
