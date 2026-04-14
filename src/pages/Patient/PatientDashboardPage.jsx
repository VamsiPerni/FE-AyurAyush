import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
    Calendar,
    CalendarCheck,
    CheckCircle,
    XCircle,
    Hash,
    Users,
    CalendarPlus,
    MessageSquare,
    AlertCircle,
    FileText,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AppContext";
import { patientService } from "../../services/patientService";
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
import { StatsSkeleton, CardSkeleton } from "../../components/ui/Skeleton";
import { AppointmentCard } from "../../components/patient/AppointmentCard";
import PossibleDelayWarning from "../../components/patient/PossibleDelayWarning";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const PatientDashboardPage = () => {
    const navigate = useNavigate();
    const { name } = useAuthContext();
    const patientName = name || "Patient";

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [liveQueue, setLiveQueue] = useState({
        appointment: null,
        loading: true,
    });
    const shownNotificationKeysRef = useRef(new Set());

    const getNotificationKey = (apt) => {
        if (!apt) return "";
        const id = apt._id || apt.appointmentId || "na";
        const stamp = apt.lastCalledAt || apt.queueCallCount || "0";
        return `${id}:${apt.queueStatus || "waiting"}:${stamp}`;
    };

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await patientService.getDashboard();
            setDashboard(result.data?.data || result.data || {});
        } catch (err) {
            const message = "Unable to load dashboard. Please try again.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadLiveQueue = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLiveQueue((prev) => ({ ...prev, loading: true }));
            }

            const result = await patientService.getAppointments();
            const allAppointments =
                result.data?.appointments || result.data || [];
            const activeQueueStatuses = [
                "confirmed",
                "called",
                "in_consultation",
            ];
            const isToday = (value) => {
                if (!value) return false;
                const d = new Date(value);
                const now = new Date();
                
                // Compare by local date string to be resilient to 00:00 UTC issues
                const dStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
                const nowStr = now.toLocaleDateString('en-CA');
                
                return dStr === nowStr;
            };

            const candidates = allAppointments
                .filter(
                    (apt) =>
                        activeQueueStatuses.includes(apt.status) &&
                        isToday(apt.date),
                )
                .sort((a, b) => {
                    const aSeq = Number(
                        a.tokenSequence ||
                            Number(
                                String(a.tokenNumber || "")
                                    .split("-")
                                    .pop(),
                            ) ||
                            Number.MAX_SAFE_INTEGER,
                    );
                    const bSeq = Number(
                        b.tokenSequence ||
                            Number(
                                String(b.tokenNumber || "")
                                    .split("-")
                                    .pop(),
                            ) ||
                            Number.MAX_SAFE_INTEGER,
                    );
                    if (aSeq !== bSeq) return aSeq - bSeq;
                    return (
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                });

            const activeAppointment = candidates[0] || null;

            if (
                activeAppointment &&
                ["called", "in_consultation"].includes(
                    activeAppointment.queueStatus,
                )
            ) {
                const key = getNotificationKey(activeAppointment);
                // Notification recency check: only toast if called in the last 10 minutes
                // This prevents old 'called' statuses from spamming toasts on page reload
                const lastCalledAt = activeAppointment.lastCalledAt;
                const isRecent = lastCalledAt && (Date.now() - new Date(lastCalledAt).getTime() < 120000);

                if (key && isRecent && !shownNotificationKeysRef.current.has(key)) {
                    shownNotificationKeysRef.current.add(key);
                    showSuccessToast(
                        activeAppointment.queueNotificationMessage ||
                            "It is your turn. Please proceed to consultation area.",
                    );
                }
            }

            setLiveQueue({
                appointment: activeAppointment,
                loading: false,
            });
        } catch {
            if (!silent) {
                setLiveQueue({ appointment: null, loading: false });
            }
        }
    };

    useEffect(() => {
        loadLiveQueue();

        const intervalId = setInterval(() => {
            loadLiveQueue({ silent: true });
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // 1. Loading State
    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title={`Welcome back, ${patientName}`}
                    subtitle="Manage your appointments and health journey"
                />
                <StatsSkeleton count={4} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <CardSkeleton className="lg:col-span-2" />
                    <CardSkeleton />
                </div>
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
                    action={<Button onClick={loadDashboard}>Try Again</Button>}
                />
            </div>
        );
    }

    // 3. Data Extraction
    const stats = dashboard?.stats || {};
    const recentAppointments = dashboard?.recentAppointments || [];
    const liveQueueAppointment = liveQueue.appointment;

    // Quick action buttons snippet
    const headerActions = (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <Button
                variant="secondary"
                icon={MessageSquare}
                onClick={() => navigate("/patient/chatbot")}
            >
                AI Chatbot
            </Button>
            <Button
                icon={CalendarPlus}
                onClick={() => navigate("/patient/book-appointment")}
            >
                Book Appointment
            </Button>
        </div>
    );

    return (
        <div className="space-y-8 pb-8">
            <PageHeader
                title={`Welcome back, ${patientName}`}
                subtitle="Manage your appointments and health journey with AyurAyush"
                action={headerActions}
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Appointments"
                    value={stats.totalAppointments || stats.total || 0}
                    icon={Calendar}
                    variant="default"
                />
                <StatCard
                    label="Upcoming"
                    value={stats.upcomingAppointments || stats.upcoming || 0}
                    icon={CalendarCheck}
                    variant="info"
                />
                <StatCard
                    label="Completed"
                    value={stats.completedAppointments || stats.completed || 0}
                    icon={CheckCircle}
                    variant="success"
                />
                <StatCard
                    label="Cancelled"
                    value={stats.cancelledAppointments || stats.cancelled || 0}
                    icon={XCircle}
                    variant="error"
                />
            </div>

            {liveQueueAppointment?.doctor?.id && (
                <PossibleDelayWarning doctorId={liveQueueAppointment.doctor.id} />
            )}

            <Card className="border border-primary-100 dark:border-primary-800/30 bg-linear-to-r from-primary-50/90 to-white dark:from-primary-900/10 dark:to-dark-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-primary-800">
                        <span className="dark:text-primary-300">Live Queue</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {liveQueue.loading ? (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Loading live queue...
                        </p>
                    ) : liveQueueAppointment ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                    You are in today's queue with{" "}
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        Dr.{" "}
                                        {liveQueueAppointment?.doctor?.name ||
                                            "Doctor"}
                                    </span>
                                </p>
                                {(liveQueueAppointment.queueStatus ===
                                    "called" ||
                                    liveQueueAppointment.queueStatus ===
                                        "in_consultation") && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl px-3 py-2 text-sm">
                                        <p className="font-semibold text-blue-700 dark:text-blue-300">
                                            {liveQueueAppointment.queueNotificationMessage ||
                                                "It is your turn. Please proceed to consultation area."}
                                        </p>
                                        {liveQueueAppointment.lastCalledAt && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                Last notified at{" "}
                                                {new Date(
                                                    liveQueueAppointment.lastCalledAt,
                                                ).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-elevated border border-primary-200 dark:border-primary-700/50 text-primary-800 dark:text-primary-300 font-mono font-bold">
                                        <Hash className="w-3.5 h-3.5" />
                                        {liveQueueAppointment.tokenNumber ||
                                            "-"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-primary-700 dark:text-primary-400">
                                        <Users className="w-4 h-4" />
                                        {liveQueueAppointment.queueAheadCount !==
                                            null &&
                                        liveQueueAppointment.queueAheadCount !==
                                            undefined
                                            ? `${liveQueueAppointment.queueAheadCount} people ahead`
                                            : "Queue updating"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        navigate(
                                            `/patient/appointments/${liveQueueAppointment._id || liveQueueAppointment.appointmentId}`,
                                        )
                                    }
                                >
                                    Open Queue Details
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            No active queue appointment right now.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Recent Appointments Section */}
            <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                    Recent Appointments
                </h2>
                {recentAppointments.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/patient/appointments")}
                    >
                        View All
                    </Button>
                )}
            </div>

            {recentAppointments.length === 0 ? (
                <Card className="border-dashed border-2 bg-neutral-50/50 dark:bg-dark-card">
                    <EmptyState
                        icon={FileText}
                        title="No appointments yet"
                        description="Book your first appointment to start tracking your treatment journey."
                        action={
                            <Button
                                icon={CalendarPlus}
                                onClick={() =>
                                    navigate("/patient/book-appointment")
                                }
                            >
                                Book Appointment
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentAppointments.slice(0, 3).map((apt) => (
                        <AppointmentCard
                            key={apt._id || apt.appointmentId}
                            appointment={apt}
                            onView={() =>
                                navigate(
                                    `/patient/appointments/${apt._id || apt.appointmentId}`,
                                )
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { PatientDashboardPage };
export default PatientDashboardPage;
