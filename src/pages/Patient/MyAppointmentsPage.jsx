import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { Calendar, Plus, AlertCircle, FileText } from "lucide-react";
import { patientService } from "../../services/patientService";
import { AppointmentCard } from "../../components/patient/AppointmentCard";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/shared/PageHeader";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const filterCategories = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
];

const MyAppointmentsPage = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const shownNotificationKeysRef = useRef(new Set());

    const getNotificationKey = (apt) => {
        const id = apt._id || apt.appointmentId || "na";
        const stamp = apt.lastCalledAt || apt.queueCallCount || "0";
        return `${id}:${apt.queueStatus || "waiting"}:${stamp}`;
    };

    const loadAppointments = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError("");
            }
            // Fetch all appointments
            const result = await patientService.getAppointments();
            const nextAppointments =
                result.data?.appointments || result.data || [];

            nextAppointments.forEach((apt) => {
                if (["called", "in_consultation"].includes(apt.queueStatus)) {
                    const key = getNotificationKey(apt);
                    if (key && !shownNotificationKeysRef.current.has(key)) {
                        shownNotificationKeysRef.current.add(key);
                        showSuccessToast(
                            apt.queueNotificationMessage ||
                                "It is your turn. Please proceed to consultation area.",
                        );
                    }
                }
            });

            setAppointments(nextAppointments);
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to load appointments";
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
        const id = setInterval(() => {
            loadAppointments({ silent: true });
        }, 5000);
        return () => clearInterval(id);
    }, []);

    const handleCancel = async (id) => {
        try {
            setCancellingId(id);
            await patientService.cancelAppointment(id);
            showSuccessToast("Appointment cancelled successfully");
            setAppointments((prev) =>
                prev.map((apt) => {
                    if ((apt._id || apt.appointmentId) === id) {
                        return { ...apt, status: "cancelled" };
                    }
                    return apt;
                }),
            );
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to cancel appointment",
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Client-side filtering logic
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            if (activeTab === "all") return true;
            if (activeTab === "upcoming")
                return ["pending_admin_approval", "confirmed"].includes(
                    apt.status,
                );
            if (activeTab === "completed") return apt.status === "completed";
            if (activeTab === "cancelled")
                return ["cancelled", "rejected"].includes(apt.status);
            return true;
        });
    }, [appointments, activeTab]);

    // Count logic per tab
    const counts = useMemo(() => {
        return {
            all: appointments.length,
            upcoming: appointments.filter((a) =>
                ["pending_admin_approval", "confirmed"].includes(a.status),
            ).length,
            completed: appointments.filter((a) => a.status === "completed")
                .length,
            cancelled: appointments.filter((a) =>
                ["cancelled", "rejected"].includes(a.status),
            ).length,
        };
    }, [appointments]);

    // Loading State
    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="My Appointments"
                    subtitle="Track status, review details, and manage upcoming visits"
                />
                <div className="flex gap-2">
                    {filterCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className="h-8 w-20 bg-neutral-200 rounded-full animate-pulse"
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    // Error State
    if (error && appointments.length === 0) {
        return (
            <div className="py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to load appointments"
                    description={error}
                    action={
                        <Button onClick={loadAppointments}>Try Again</Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <PageHeader
                title="My Appointments"
                subtitle="Track status, review details, and manage upcoming visits"
                action={
                    <Button
                        icon={Plus}
                        onClick={() => navigate("/patient/book-appointment")}
                    >
                        Book Appointment
                    </Button>
                }
            />

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
              px-2 py-0.5 rounded-full text-xs
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

            {/* Content Area */}
            {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-neutral-100 p-12">
                    <EmptyState
                        icon={FileText}
                        title={
                            activeTab === "all"
                                ? "No appointments found"
                                : `No ${filterCategories.find((c) => c.id === activeTab)?.label.toLowerCase()} appointments`
                        }
                        description={
                            activeTab === "all"
                                ? "Start a consultation with our AI to book your first appointment."
                                : `You don't have any appointments in this category.`
                        }
                        action={
                            <Button
                                icon={Plus}
                                onClick={() =>
                                    navigate("/patient/book-appointment")
                                }
                            >
                                Book Appointment
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments.map((apt) => (
                        <AppointmentCard
                            key={apt._id || apt.appointmentId}
                            appointment={apt}
                            onView={(id) =>
                                navigate(`/patient/appointments/${id}`)
                            }
                            onCancel={handleCancel}
                            loading={
                                cancellingId === (apt._id || apt.appointmentId)
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { MyAppointmentsPage };
export default MyAppointmentsPage;
