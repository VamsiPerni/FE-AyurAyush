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
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    ShieldAlert,
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
    const [upcomingMeta, setUpcomingMeta] = useState({ totalCount: 0, page: 1, totalPages: 1 });
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [upcomingDate, setUpcomingDate] = useState("");
    const [upcomingLoading, setUpcomingLoading] = useState(false);
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

    const loadUpcoming = useCallback(async ({ page = 1, date = "" } = {}) => {
        try {
            setUpcomingLoading(true);
            const result = await doctorService.getUpcomingAppointments({ page, date, limit: 5 });
            const payload = result?.data || result || {};
            setUpcomingAppointments(payload.appointments || []);
            setUpcomingMeta({
                totalCount: payload.totalCount || 0,
                page: payload.page || 1,
                totalPages: payload.totalPages || 1,
            });
        } catch {
            // silent fail
        } finally {
            setUpcomingLoading(false);
        }
    }, []);

    const loadDashboard = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError("");
            }
            const [dashboardResult, appointmentsResult] = await Promise.all([
                doctorService.getDashboard(),
                doctorService.getAppointments(),
            ]);

            const dashboardPayload =
                dashboardResult?.data || dashboardResult || {};
            setDashboard(dashboardPayload);

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
        loadUpcoming({ page: 1, date: "" });
    }, [loadDashboard, loadUpcoming]);

    useEffect(() => {
        loadUpcoming({ page: upcomingPage, date: upcomingDate });
    }, [upcomingPage, upcomingDate, loadUpcoming]);

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

            {/* Upcoming Agenda */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-dark-border">
                    <div className="flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Upcoming Agenda</CardTitle>
                        {upcomingMeta.totalCount > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                                {upcomingMeta.totalCount} total
                            </span>
                        )}
                    </div>
                    {/* Date Picker */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                            <Calendar className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                            <input
                                type="date"
                                value={upcomingDate}
                                onChange={(e) => {
                                    setUpcomingDate(e.target.value);
                                    setUpcomingPage(1);
                                }}
                                className="pl-9 pr-3 h-9 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        {upcomingDate && (
                            <button
                                onClick={() => { setUpcomingDate(""); setUpcomingPage(1); }}
                                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {upcomingLoading ? (
                        <div className="p-6 space-y-3">
                            {[1,2,3].map((i) => (
                                <div key={i} className="h-16 bg-neutral-100 dark:bg-dark-elevated rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : upcomingAppointments.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={CalendarCheck}
                                title={upcomingDate ? "No appointments on this date" : "No upcoming appointments"}
                                description={upcomingDate ? "Try selecting a different date." : "Your calendar is clear for the coming days."}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-neutral-100 dark:divide-dark-border">
                                {upcomingAppointments.map((apt) => {
                                    const isEmergency = apt.urgencyLevel === "emergency";
                                    const dateObj = new Date(apt.date);
                                    const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                                    const dayNum = dateObj.toLocaleDateString("en-IN", { day: "2-digit" });
                                    const month = dateObj.toLocaleDateString("en-IN", { month: "short" });
                                    return (
                                        <div
                                            key={apt.appointmentId}
                                            className={`flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-dark-hover transition-colors ${
                                                isEmergency ? "border-l-4 border-red-500" : ""
                                            }`}
                                        >
                                            {/* Date Block */}
                                            <div className="shrink-0 w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 flex flex-col items-center justify-center">
                                                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">{dayName}</span>
                                                <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300 leading-none">{dayNum}</span>
                                                <span className="text-xs text-indigo-500 dark:text-indigo-400">{month}</span>
                                            </div>

                                            {/* Time + Patient */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                                                        {apt.timeSlot}
                                                    </span>
                                                    {isEmergency && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                            <ShieldAlert className="w-3 h-3" /> Emergency
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <User className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="font-medium truncate">{apt.patient?.name || "Patient"}</span>
                                                    {apt.patient?.phone && (
                                                        <span className="text-neutral-400 dark:text-neutral-500 text-xs">• {apt.patient.phone}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="shrink-0">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                                    apt.status === "confirmed"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50"
                                                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50"
                                                }`}>
                                                    {apt.status === "confirmed" ? "Confirmed" : "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {upcomingMeta.totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-elevated/30">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Page {upcomingMeta.page} of {upcomingMeta.totalPages} • {upcomingMeta.totalCount} appointments
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                                            disabled={upcomingMeta.page <= 1}
                                            className="p-1.5 rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setUpcomingPage((p) => Math.min(upcomingMeta.totalPages, p + 1))}
                                            disabled={upcomingMeta.page >= upcomingMeta.totalPages}
                                            className="p-1.5 rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export { DoctorDashboardPage };
export default DoctorDashboardPage;
