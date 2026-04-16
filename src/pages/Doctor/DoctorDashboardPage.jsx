import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
    CalendarCheck,
    Clock,
    CheckCircle,
    Users,
    RefreshCw,
    ClipboardList,
    AlertCircle,
    FileText,
} from "lucide-react";
import { doctorService } from "../../services/doctorService";
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
import { EmptyState } from "../../components/ui/EmptyState";
import { StatsSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import { AppointmentRow } from "../../components/doctor/AppointmentRow";
import EmergencyDelayToggle from "../../components/doctor/EmergencyDelayToggle";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const DoctorDashboardPage = () => {
    const navigate = useNavigate();
    const { name } = useAuthContext();
    const doctorName = name || "Doctor";

    const [dashboard, setDashboard] = useState(null);
    const [derivedStats, setDerivedStats] = useState({
        all: 0,
        todayAppointments: 0,
        pendingToday: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        completedToday: 0,
        uniquePatients: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const normalizeAppointments = (payload) => {
        if (Array.isArray(payload?.appointments)) return payload.appointments;
        if (Array.isArray(payload?.data?.appointments))
            return payload.data.appointments;
        if (
            Array.isArray(payload?.emergencyAppointments) ||
            Array.isArray(payload?.normalAppointments)
        ) {
            return [
                ...(Array.isArray(payload.emergencyAppointments)
                    ? payload.emergencyAppointments
                    : []),
                ...(Array.isArray(payload.normalAppointments)
                    ? payload.normalAppointments
                    : []),
            ];
        }
        if (Array.isArray(payload)) return payload;
        return [];
    };

    const loadDashboard = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError("");
            }
            const [dashboardResult, appointmentsResult, upcomingResult] = await Promise.all([
                doctorService.getDashboard(),
                doctorService.getAppointments(),
                doctorService.getUpcomingAppointments(),
            ]);

            const dashboardPayload =
                dashboardResult?.data || dashboardResult || {};
            setDashboard(dashboardPayload);

            setUpcomingAppointments(upcomingResult?.data || []);

            const appointmentsPayload =
                appointmentsResult?.data || appointmentsResult || {};
            const appointmentList = normalizeAppointments(appointmentsPayload);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const isToday = (dateLike) => {
                if (!dateLike) return false;
                const date = new Date(dateLike);
                if (Number.isNaN(date.getTime())) return false;
                return date >= today && date < tomorrow;
            };

            const uniquePatients = new Set(
                appointmentList
                    .map(
                        (a) =>
                            a?.patient?.id ||
                            a?.patient?.name ||
                            a?.patientName,
                    )
                    .filter(Boolean),
            );

            setDerivedStats({
                all: appointmentList.length,
                todayAppointments: appointmentList.filter((a) =>
                    isToday(a?.appointmentDetails?.date || a?.date),
                ).length,
                pendingToday: appointmentList.filter(
                    (a) =>
                        isToday(a?.appointmentDetails?.date || a?.date) &&
                        ["pending_admin_approval", "confirmed"].includes(
                            a?.status,
                        ),
                ).length,
                pending: appointmentList.filter(
                    (a) => a?.status === "pending_admin_approval",
                ).length,
                confirmed: appointmentList.filter(
                    (a) => a?.status === "confirmed",
                ).length,
                completed: appointmentList.filter(
                    (a) => a?.status === "completed",
                ).length,
                completedToday: appointmentList.filter(
                    (a) =>
                        a?.status === "completed" &&
                        isToday(a?.appointmentDetails?.date || a?.date),
                ).length,
                uniquePatients: uniquePatients.size,
            });
        } catch {
            if (!silent) {
                const message =
                    "Unable to load doctor dashboard. Please try again.";
                setError(message);
                showErrorToast(message);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadDashboard({ silent: true });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [loadDashboard]);

    // 1. Loading State
    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title={`Welcome back, Dr. ${doctorName}`}
                    subtitle="Manage your appointments and patient care"
                />
                <StatsSkeleton count={4} />
                <Card className="p-6">
                    <TableSkeleton rows={4} columns={3} />
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
                    title="Failed to load dashboard"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadDashboard}>
                            Try Again
                        </Button>
                    }
                />
            </div>
        );
    }

    // 3. Data Extraction
    const stats = dashboard?.stats || {};
    const todayAppointments = dashboard?.todayAppointments || [];

    const resolveCount = (primary, fallback = 0) => {
        const p = Number(primary);
        const f = Number(fallback);
        const safePrimary = Number.isFinite(p) ? p : 0;
        const safeFallback = Number.isFinite(f) ? f : 0;
        return Math.max(safePrimary, safeFallback);
    };

    const handleCallPatient = async (appointmentId) => {
        if (!appointmentId) {
            showErrorToast("Missing appointment id for call action.");
            return;
        }
        try {
            setActionLoadingId(appointmentId);
            await doctorService.callQueuePatient(appointmentId);
            showSuccessToast("Patient called successfully.");
            await loadDashboard({ silent: true });
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to call patient.",
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleStartConsultation = async (appointmentId, appointment) => {
        if (!appointmentId) {
            showErrorToast(
                "Missing appointment id for start consultation action.",
            );
            return;
        }

        if (appointment?.queueStatus === "in_consultation") {
            showSuccessToast("Resuming consultation details.");
            navigate(`/doctor/appointments/${appointmentId}`, {
                state: { from: "/doctor/today" },
            });
            return;
        }
        try {
            setActionLoadingId(appointmentId);
            await doctorService.startConsultation(appointmentId);
            showSuccessToast("Consultation started successfully.");
            await loadDashboard({ silent: true });
            navigate(`/doctor/appointments/${appointmentId}`, {
                state: { from: "/doctor/today" },
            });
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to start consultation.",
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-8">
            <PageHeader
                title={`Welcome back, Dr. ${doctorName}`}
                subtitle="Track schedules, appointments, and patient workload"
                action={
                    <Button
                        icon={CalendarCheck}
                        onClick={() => navigate("/doctor/today")}
                    >
                        Today's Schedule
                    </Button>
                }
            />

            <EmergencyDelayToggle 
                emergencyState={dashboard?.emergencyState} 
                onStatusChange={() => {
                    loadDashboard({ silent: true });
                }}
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Today's Appointments"
                    value={resolveCount(
                        stats.todayAppointments ?? stats.today,
                        derivedStats.todayAppointments,
                    )}
                    icon={CalendarCheck}
                    variant="default"
                />
                <StatCard
                    label="Pending Today"
                    value={resolveCount(
                        stats.pendingAppointmentsToday ?? stats.pendingToday,
                        derivedStats.pendingToday,
                    )}
                    icon={Clock}
                    variant="warning"
                />
                <StatCard
                    label="Completed Today"
                    value={resolveCount(
                        stats.completedAppointments ?? stats.completed,
                        derivedStats.completedToday,
                    )}
                    icon={CheckCircle}
                    variant="success"
                />
                <StatCard
                    label="Total Patients"
                    value={resolveCount(
                        stats.totalPatients ?? stats.patients,
                        derivedStats.uniquePatients,
                    )}
                    icon={Users}
                    variant="info"
                />
            </div>

            {/* Today's Appointments Grid */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-dark-border">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary-600" />
                        <CardTitle>Today's Appointments</CardTitle>
                    </div>
                    {todayAppointments.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/doctor/today")}
                        >
                            View Full Schedule
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="p-0">
                    {todayAppointments.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={FileText}
                                title="No appointments today"
                                description="Your schedule is clear for today. Take a break!"
                                action={
                                    <Button
                                        variant="outline"
                                        onClick={loadDashboard}
                                    >
                                        Refresh Flow
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {todayAppointments.slice(0, 5).map((apt) => (
                                <AppointmentRow
                                    key={apt._id || apt.appointmentId}
                                    appointment={apt}
                                    onView={(id) =>
                                        navigate(`/doctor/appointments/${id}`, {
                                            state: {
                                                from: "/doctor/dashboard",
                                            },
                                        })
                                    }
                                    onCall={handleCallPatient}
                                    onStartConsultation={
                                        handleStartConsultation
                                    }
                                    actionLoadingId={actionLoadingId}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Agenda Grid */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-dark-border">
                    <div className="flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Upcoming Agenda</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {upcomingAppointments.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={CalendarCheck}
                                title="No upcoming appointments"
                                description="Your calendar is clear for the coming days."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 dark:bg-dark-elevated">
                                    <tr className="text-left border-b border-neutral-200 dark:border-dark-border">
                                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300">Date</th>
                                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300">Time</th>
                                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300">Patient</th>
                                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingAppointments.map((apt) => (
                                        <tr key={apt.appointmentId} className="border-b border-neutral-100 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover transition-colors">
                                            <td className="py-3 px-4">
                                                {new Date(apt.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-medium">
                                                {apt.timeSlot}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                    {apt.patient?.name || "Unknown"}
                                                </div>
                                                <div className="text-xs text-neutral-500">
                                                    {apt.patient?.phone}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {apt.urgencyLevel === "emergency" ? (
                                                    <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Emergency</span>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-gray-300">Standard</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export { DoctorDashboardPage };
export default DoctorDashboardPage;
