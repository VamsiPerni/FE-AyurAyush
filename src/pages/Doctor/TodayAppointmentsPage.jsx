import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { RefreshCw, AlertCircle, FileText } from "lucide-react";
import { doctorService } from "../../services/doctorService";
import { AppointmentRow } from "../../components/doctor/AppointmentRow";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const filterCategories = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
];

const TodayAppointmentsPage = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [callingNext, setCallingNext] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [actionFeedback, setActionFeedback] = useState(null);

    const loadAppointments = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError("");
            }
            const result = await doctorService.getTodayAppointments();
            setAppointments(result.data?.appointments || result.data || []);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to load today’s schedule.";
            if (!silent) {
                setError(message);
                showErrorToast(message);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadAppointments({ silent: true });
        }, 20000);

        return () => clearInterval(intervalId);
    }, []);

    const handleCallNext = async () => {
        try {
            setCallingNext(true);
            setActionFeedback(null);
            const res = await doctorService.callNextQueuePatient();
            showSuccessToast(
                `Notified ${res?.data?.tokenNumber || "next patient"} successfully`,
            );
            setActionFeedback({
                type: "success",
                text: `Notification triggered for token ${res?.data?.tokenNumber || "N/A"}. Queue state should now be notified.`,
            });
            await loadAppointments({ silent: true });
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to call next patient";
            showErrorToast(message);
            setActionFeedback({
                type: "error",
                text: `Notify Next failed (${err.response?.status || "no-status"}): ${message}`,
            });
        } finally {
            setCallingNext(false);
        }
    };

    const handleCallPatient = async (appointmentId) => {
        if (!appointmentId) {
            setActionFeedback({
                type: "error",
                text: "Notify failed: missing appointment id in row payload.",
            });
            return;
        }

        const previousAppointments = appointments;
        try {
            setActionLoadingId(appointmentId);
            setActionFeedback(null);
            setActionFeedback({
                type: "success",
                text: "Sending notify request...",
            });
            setAppointments((prev) =>
                prev.map((apt) => {
                    const id = apt._id || apt.appointmentId;
                    if (id !== appointmentId) return apt;
                    return {
                        ...apt,
                        queueStatus: "called",
                        queueCallCount: (apt.queueCallCount || 0) + 1,
                        lastCalledAt: new Date().toISOString(),
                    };
                }),
            );
            await doctorService.callQueuePatient(appointmentId);
            showSuccessToast("Patient notified");
            setActionFeedback({
                type: "success",
                text: "Patient notification sent. Queue state updated to notified.",
            });
            await loadAppointments({ silent: true });
        } catch (err) {
            setAppointments(previousAppointments);
            const message =
                err.response?.data?.message || "Failed to call patient";
            showErrorToast(message);
            setActionFeedback({
                type: "error",
                text: `Notify failed (${err.response?.status || "no-status"}): ${message}`,
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleStartConsultation = async (appointmentId, appointment) => {
        if (!appointmentId) {
            setActionFeedback({
                type: "error",
                text: "Start consultation failed: missing appointment id in row payload.",
            });
            return;
        }

        if (appointment?.queueStatus === "in_consultation") {
            setActionFeedback({
                type: "success",
                text: "Resuming consultation details.",
            });
            navigate(`/doctor/appointments/${appointmentId}`, {
                state: { from: "/doctor/today" },
            });
            return;
        }

        const previousAppointments = appointments;
        try {
            setActionLoadingId(appointmentId);
            setActionFeedback(null);
            setActionFeedback({
                type: "success",
                text: "Sending start consultation request...",
            });
            setAppointments((prev) =>
                prev.map((apt) => {
                    const id = apt._id || apt.appointmentId;
                    if (id !== appointmentId) return apt;
                    return {
                        ...apt,
                        queueStatus: "in_consultation",
                    };
                }),
            );
            await doctorService.startConsultation(appointmentId);
            showSuccessToast("Consultation started");
            setActionFeedback({
                type: "success",
                text: "Consultation started. Queue state updated to in_consultation.",
            });
            await loadAppointments({ silent: true });
            navigate(`/doctor/appointments/${appointmentId}`, {
                state: { from: "/doctor/today" },
            });
        } catch (err) {
            setAppointments(previousAppointments);
            const message =
                err.response?.data?.message || "Failed to start consultation";
            showErrorToast(message);
            setActionFeedback({
                type: "error",
                text: `Start consultation failed (${err.response?.status || "no-status"}): ${message}`,
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    const formatter = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const todayDateString = formatter.format(new Date());

    // Client-side filtering
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            if (activeTab === "all") return true;
            if (activeTab === "pending")
                return ["pending_admin_approval"].includes(apt.status);
            if (activeTab === "confirmed") return apt.status === "confirmed";
            if (activeTab === "completed") return apt.status === "completed";
            return true;
        });
    }, [appointments, activeTab]);

    const counts = useMemo(() => {
        return {
            all: appointments.length,
            pending: appointments.filter((a) =>
                ["pending_admin_approval"].includes(a.status),
            ).length,
            confirmed: appointments.filter((a) => a.status === "confirmed")
                .length,
            completed: appointments.filter((a) => a.status === "completed")
                .length,
        };
    }, [appointments]);

    // Loading State
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Today's Appointments"
                    subtitle={`${todayDateString} • Fetching queue...`}
                />
                <div className="flex gap-2">
                    {filterCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className="h-8 w-24 bg-neutral-200 rounded-full animate-pulse"
                        />
                    ))}
                </div>
                <Card className="p-6">
                    <TableSkeleton rows={6} columns={4} />
                </Card>
            </div>
        );
    }

    // Error State
    if (error && appointments.length === 0) {
        return (
            <div className="max-w-6xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to Load Schedule"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadAppointments}>
                            Retry Fetching
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Today's Appointments"
                subtitle={`${todayDateString} • ${counts.all} Total Appointments`}
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleCallNext}
                            loading={callingNext}
                        >
                            Notify Next Patient
                        </Button>
                        <Button
                            variant="secondary"
                            icon={RefreshCw}
                            onClick={() => loadAppointments()}
                        >
                            Refresh Sync
                        </Button>
                    </div>
                }
            />

            {actionFeedback && (
                <div
                    className={`rounded-lg border px-4 py-3 text-sm ${actionFeedback.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
                >
                    {actionFeedback.text}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {filterCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                  activeTab === cat.id
                      ? "bg-primary-600 text-white"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-800"
              }
            `}
                    >
                        {cat.label}
                        <span
                            className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${
                  activeTab === cat.id
                      ? "bg-primary-500/30 text-white"
                      : "bg-neutral-100 text-neutral-500"
              }
            `}
                        >
                            {counts[cat.id]}
                        </span>
                    </button>
                ))}
            </div>

            <Card className="overflow-hidden min-h-100">
                <CardContent className="p-0">
                    {filteredAppointments.length === 0 ? (
                        <div className="py-20 bg-neutral-50/50">
                            <EmptyState
                                icon={FileText}
                                title={
                                    activeTab === "all"
                                        ? "No appointments today"
                                        : `No ${filterCategories.find((c) => c.id === activeTab)?.label.toLowerCase()} appointments`
                                }
                                description={
                                    activeTab === "all"
                                        ? "Your schedule is currently clear for the day."
                                        : `You don't have any patients matching this status.`
                                }
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredAppointments.map((apt) => (
                                <AppointmentRow
                                    key={apt._id || apt.appointmentId}
                                    appointment={apt}
                                    onView={(id) =>
                                        navigate(`/doctor/appointments/${id}`, {
                                            state: { from: "/doctor/today" },
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
        </div>
    );
};

export { TodayAppointmentsPage };
export default TodayAppointmentsPage;
