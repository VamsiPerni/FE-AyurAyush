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
    const PAGE_SIZE = 12;
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [tabCounts, setTabCounts] = useState({
        all: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
    });
    const shownNotificationKeysRef = useRef(new Set());

    const getNotificationKey = (apt) => {
        const id = apt._id || apt.appointmentId || "na";
        const stamp = apt.lastCalledAt || apt.queueCallCount || "0";
        return `${id}:${apt.queueStatus || "waiting"}:${stamp}`;
    };

    const getStatusParam = (tab) => {
        if (tab === "all") return "";
        if (tab === "upcoming") return "upcoming";
        if (tab === "completed") return "completed";
        if (tab === "cancelled") return "cancelled";
        return "";
    };

    const loadAppointments = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError("");
            }

            const result = await patientService.getAppointments({
                status: getStatusParam(activeTab),
                page: currentPage,
                limit: PAGE_SIZE,
                sort: (activeTab === "all" || activeTab === "completed" || activeTab === "cancelled") ? "desc" : "asc",
            });
            const nextAppointments =
                result.data?.appointments || result.data || [];

            const pageMeta = result.data || {};
            setTotalPages(Math.max(1, Number(pageMeta.totalPages) || 1));
            setTotalCount(Number(pageMeta.totalCount) || 0);

            nextAppointments.forEach((apt) => {
                if (["called", "in_consultation"].includes(apt.queueStatus)) {
                    const key = getNotificationKey(apt);
                    // Notification recency check: only toast if called in the last 10 minutes
                    const lastCalledAt = apt.lastCalledAt;
                    const isRecent =
                        lastCalledAt &&
                        Date.now() - new Date(lastCalledAt).getTime() < 120000;

                    if (
                        key &&
                        isRecent &&
                        !shownNotificationKeysRef.current.has(key)
                    ) {
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
    }, [activeTab, currentPage]);

    useEffect(() => {
        const id = setInterval(() => {
            loadAppointments({ silent: true });
        }, 5000);
        return () => clearInterval(id);
    }, [activeTab, currentPage]);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const result = await patientService.getDashboard();
                const stats =
                    result?.data?.data?.stats || result?.data?.stats || {};
                setTabCounts({
                    all: Number(stats.totalAppointments || stats.total || 0),
                    upcoming: Number(
                        stats.upcomingAppointments || stats.upcoming || 0,
                    ),
                    completed: Number(
                        stats.completedAppointments || stats.completed || 0,
                    ),
                    cancelled: Number(
                        stats.cancelledAppointments || stats.cancelled || 0,
                    ),
                });
            } catch {
                // Keep fallback counts if dashboard fetch fails.
            }
        };
        loadCounts();
    }, []);

    const handleCancel = async (id) => {
        try {
            setCancellingId(id);
            await patientService.cancelAppointment(id);
            showSuccessToast("Appointment cancelled successfully");
            await loadAppointments();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to cancel appointment",
            );
        } finally {
            setCancellingId(null);
        }
    };

    const filteredAppointments = useMemo(() => appointments, [appointments]);

    const counts = useMemo(
        () => ({
            ...tabCounts,
            [activeTab]: totalCount,
        }),
        [tabCounts, activeTab, totalCount],
    );

    const visiblePageNumbers = useMemo(() => {
        const total = Math.max(1, totalPages);
        const pages = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(total, start + 4);
        for (let p = start; p <= end; p++) pages.push(p);
        return pages;
    }, [currentPage, totalPages]);

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
                            className="h-8 w-20 bg-neutral-200 dark:bg-dark-elevated rounded-full animate-pulse"
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
                        onClick={() => {
                            setActiveTab(cat.id);
                            setCurrentPage(1);
                        }}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                  activeTab === cat.id
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-dark-card text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover hover:text-neutral-800 dark:hover:text-neutral-100"
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
                      : "bg-neutral-100 dark:bg-dark-elevated text-neutral-500 dark:text-neutral-400"
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
                <div className="bg-white dark:bg-dark-card rounded-xl border border-neutral-100 dark:border-dark-border p-12">
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
                <>
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
                                    cancellingId ===
                                    (apt._id || apt.appointmentId)
                                }
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            {visiblePageNumbers.map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === currentPage
                                            ? "primary"
                                            : "outline"
                                    }
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export { MyAppointmentsPage };
export default MyAppointmentsPage;
