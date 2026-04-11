import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    Stethoscope,
    Users,
    CalendarCheck,
    Clock,
    Settings,
    Layers,
    PlusCircle,
    AlertCircle,
    RefreshCw,
    FileText,
    ArrowRight,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useAuthContext } from "../../contexts/AppContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatsSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import { TodayQueue } from "../../components/admin/TodayQueue";
import { showErrorToast } from "../../utils/toastMessageHelper";

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { name } = useAuthContext();
    const adminName = name || "Admin";

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await adminService.getDashboard();
            setDashboard(
                result.data?.dashboard ||
                    result.data?.data?.dashboard ||
                    result.data?.data ||
                    result.data ||
                    {},
            );
        } catch (err) {
            const message =
                "Unable to connect to the administration API. Please try again.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const formatDateIN = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // 1. Loading State
    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title={`Welcome, ${adminName}`}
                    subtitle="AyurAyush Management Console"
                />
                <StatsSkeleton count={4} />
                <Card className="p-6">
                    <TableSkeleton rows={5} columns={5} />
                </Card>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="System Connection Error"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadDashboard}>
                            Retry Connection
                        </Button>
                    }
                />
            </div>
        );
    }

    // 3. Data Parsing
    const stats = dashboard?.stats || {};
    const recentAppointments = (dashboard?.recentAppointments || []).slice(
        0,
        5,
    );

    const columns = [
        {
            key: "patient",
            header: "Patient",
            render: (_, apt) => (
                <span className="font-semibold text-neutral-800">
                    {apt.patient?.name || apt.patientName || "Unknown"}
                </span>
            ),
        },
        {
            key: "doctor",
            header: "Doctor",
            render: (_, apt) => (
                <span className="font-medium text-neutral-600">
                    Dr. {apt.doctor?.name || apt.doctorName || "Unassigned"}
                </span>
            ),
        },
        {
            key: "date",
            header: "Date & Time",
            render: (_, apt) => (
                <span>
                    <span className="font-medium text-neutral-700">
                        {formatDateIN(apt.date)}
                    </span>
                    <span className="text-neutral-500 text-sm ml-1.5">
                        • {apt.timeSlot}
                    </span>
                </span>
            ),
        },
        {
            key: "urgency",
            header: "Urgency",
            render: (_, apt) =>
                apt.urgencyLevel === "emergency" ? (
                    <Badge type="status" value="emergency">
                        Emergency
                    </Badge>
                ) : (
                    <span className="text-neutral-400 font-medium text-sm">
                        Normal
                    </span>
                ),
        },
        {
            key: "status",
            header: "Status",
            render: (_, apt) => <Badge type="status" value={apt.status} />,
        },
    ];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title={`Welcome, ${adminName}`}
                subtitle="AyurAyush Central Administrative Overview"
                action={
                    <Button
                        variant="outline"
                        icon={RefreshCw}
                        onClick={loadDashboard}
                    >
                        Refresh System
                    </Button>
                }
            />

            {/* Hero Header / System Metrics */}
            <div className="bg-linear-to-r from-primary-800 to-primary-700 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                        System Status: Optimal
                    </h2>
                    <p className="text-primary-100 max-w-lg mb-6 leading-relaxed">
                        All hospital operations are executing normally. Monitor
                        pending approvals and clinical rosters from the
                        dashboard efficiently.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            icon={Settings}
                            onClick={() => navigate("/admin/doctors")}
                            className="w-full sm:w-auto"
                        >
                            Manage Doctors
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 border-white/20 text-white w-full sm:w-auto"
                            icon={Layers}
                            onClick={() => navigate("/admin/queues")}
                        >
                            Appointment Queues
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 border-white/20 text-white w-full sm:w-auto"
                            icon={PlusCircle}
                            onClick={() => navigate("/admin/offline-booking")}
                        >
                            Offline Booking
                        </Button>
                    </div>
                </div>
            </div>

            {/* Primary Statistics Rollup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Doctors"
                    value={stats.totalDoctors ?? stats.doctors ?? 0}
                    icon={Stethoscope}
                    variant="default"
                />
                <StatCard
                    label="Total Patients"
                    value={stats.totalPatients ?? stats.patients ?? 0}
                    icon={Users}
                    variant="info"
                />
                <StatCard
                    label="Today's Appointments"
                    value={stats.todayAppointments ?? stats.today ?? 0}
                    icon={CalendarCheck}
                    variant="success"
                />
                <StatCard
                    label="Pending Approvals"
                    value={stats.pendingApprovals ?? stats.pending ?? 0}
                    icon={Clock}
                    variant="warning"
                />
            </div>

            {/* Global Recent Appointments Table */}
            <Card className="overflow-hidden shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        <CardTitle>Recent Appointments</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/admin/queues")}
                        className="group"
                    >
                        View All Queues{" "}
                        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    {recentAppointments.length === 0 ? (
                        <div className="py-16">
                            <EmptyState
                                icon={FileText}
                                title="No recent clinical transactions"
                                description="The system has not logged any recent appointments."
                            />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table
                                columns={columns}
                                data={recentAppointments}
                                striped
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Live Queue With Consultation Timing */}
            <TodayQueue />
        </div>
    );
};

export { AdminDashboardPage };
export default AdminDashboardPage;
