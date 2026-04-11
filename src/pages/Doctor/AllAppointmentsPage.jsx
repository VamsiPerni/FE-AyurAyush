import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
    Search,
    RefreshCw,
    AlertCircle,
    FileText,
    ChevronRight,
} from "lucide-react";
import { doctorService } from "../../services/doctorService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { showErrorToast } from "../../utils/toastMessageHelper";

const filterCategories = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
];

const AllAppointmentsPage = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("latest");

    const normalizeAppointmentRow = (item = {}) => ({
        ...item,
        appointmentId: item?.appointmentId || item?._id,
        patientName: String(
            item?.patient?.name || item?.patientName || "Patient",
        ),
        status: String(item?.status || "pending_admin_approval").toLowerCase(),
        urgencyLevel:
            item?.urgencyLevel === "emergency" ? "emergency" : "normal",
        date: item?.appointmentDetails?.date || item?.date || null,
        timeSlot: item?.appointmentDetails?.timeSlot || item?.timeSlot || "-",
        queueStatus:
            item?.queueStatus || item?.appointmentDetails?.queueStatus || null,
        queueCallCount: Number.isFinite(Number(item?.queueCallCount))
            ? Number(item.queueCallCount)
            : Number.isFinite(Number(item?.appointmentDetails?.queueCallCount))
              ? Number(item.appointmentDetails.queueCallCount)
              : 0,
        lastCalledAt:
            item?.lastCalledAt ||
            item?.appointmentDetails?.lastCalledAt ||
            null,
        consultationStartedAt:
            item?.consultationStartedAt ||
            item?.appointmentDetails?.consultationStartedAt ||
            null,
        consultationDurationSeconds: Number.isFinite(
            Number(item?.consultationDurationSeconds),
        )
            ? Number(item.consultationDurationSeconds)
            : Number.isFinite(
                    Number(
                        item?.appointmentDetails?.consultationDurationSeconds,
                    ),
                )
              ? Number(item.appointmentDetails.consultationDurationSeconds)
              : null,
    });

    const normalizeAppointments = (payload) => {
        if (Array.isArray(payload?.appointments)) {
            return payload.appointments.map(normalizeAppointmentRow);
        }
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
            ].map(normalizeAppointmentRow);
        }
        if (Array.isArray(payload)) {
            return payload.map(normalizeAppointmentRow);
        }
        return [];
    };

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError("");
            const fetchFn =
                doctorService.getAllAppointments ||
                doctorService.getAppointments;
            const result = await fetchFn();
            const payload = result?.data || result || {};
            setAppointments(normalizeAppointments(payload));
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to load appointments history.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const formatDateIN = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getAppointmentTimestamp = (apt) => {
        if (!apt?.date) return 0;

        const baseDate = new Date(apt.date);
        if (Number.isNaN(baseDate.getTime())) return 0;

        let hours = 0;
        let minutes = 0;
        const slot = String(apt.timeSlot || "").trim();
        const startPart = slot.split("-")[0]?.trim();
        const match = startPart?.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

        if (match) {
            const rawHour = Number(match[1]);
            minutes = Number(match[2] || "0");
            const meridiem = (match[3] || "").toUpperCase();

            if (meridiem === "PM" && rawHour < 12) {
                hours = rawHour + 12;
            } else if (meridiem === "AM" && rawHour === 12) {
                hours = 0;
            } else {
                hours = rawHour;
            }
        }

        return new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            hours,
            minutes,
            0,
            0,
        ).getTime();
    };

    const filteredAppointments = useMemo(() => {
        const safeAppointments = Array.isArray(appointments)
            ? appointments
            : [];
        const result = safeAppointments.filter((apt) => {
            const name = (apt.patientName || "").toLowerCase();
            if (searchQuery && !name.includes(searchQuery.toLowerCase())) {
                return false;
            }

            if (urgencyFilter !== "all" && apt.urgencyLevel !== urgencyFilter) {
                return false;
            }

            if (activeTab === "all") return true;
            if (activeTab === "pending") {
                return apt.status === "pending_admin_approval";
            }
            if (activeTab === "confirmed") return apt.status === "confirmed";
            if (activeTab === "completed") return apt.status === "completed";
            if (activeTab === "cancelled") {
                return ["cancelled", "rejected"].includes(apt.status);
            }
            return true;
        });

        return result.sort((a, b) => {
            const diff =
                getAppointmentTimestamp(b) - getAppointmentTimestamp(a);
            return sortOrder === "latest" ? diff : -diff;
        });
    }, [appointments, activeTab, searchQuery, urgencyFilter, sortOrder]);

    const counts = useMemo(() => {
        const safeAppointments = Array.isArray(appointments)
            ? appointments
            : [];
        return {
            all: safeAppointments.length,
            pending: safeAppointments.filter(
                (a) => a.status === "pending_admin_approval",
            ).length,
            confirmed: safeAppointments.filter((a) => a.status === "confirmed")
                .length,
            completed: safeAppointments.filter((a) => a.status === "completed")
                .length,
            cancelled: safeAppointments.filter((a) =>
                ["cancelled", "rejected"].includes(a.status),
            ).length,
        };
    }, [appointments]);

    const handleRowClick = (apt) => {
        const id = apt.appointmentId || apt._id;
        if (id)
            navigate(`/doctor/appointments/${id}`, {
                state: { from: "/doctor/appointments" },
            });
    };

    const columns = [
        {
            key: "patient",
            label: "Patient Name",
            render: (_, row) => (
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                    {row.patientName}
                </span>
            ),
        },
        {
            key: "date",
            label: "Date",
            render: (_, row) => (
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                    {formatDateIN(row.date)}
                </span>
            ),
        },
        {
            key: "timeSlot",
            label: "Time Slot",
            render: (_, row) => (
                <span className="text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
                    {row.timeSlot}
                </span>
            ),
        },
        {
            key: "urgency",
            label: "Urgency",
            render: (_, row) =>
                row.urgencyLevel === "emergency" ? (
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
            label: "Status",
            render: (_, row) => <Badge type="status" value={row.status} />,
        },
        {
            key: "actions",
            label: "Action",
            className: "text-right",
            render: (_, row) => (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(row);
                        }}
                        className="rounded-full"
                        icon={ChevronRight}
                    />
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="All Appointments"
                    subtitle="Fetching comprehensive schedule history..."
                />
                <Card className="p-6">
                    <TableSkeleton rows={8} columns={6} />
                </Card>
            </div>
        );
    }

    if (error && (!Array.isArray(appointments) || appointments.length === 0)) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Data Synchronization Error"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadAppointments}>
                            Retry Synchronization
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="All Appointments"
                subtitle={`Managing ${counts.all} total registered case${counts.all !== 1 ? "s" : ""}`}
                backTo="/doctor/dashboard"
                action={
                    <Button
                        variant="outline"
                        icon={RefreshCw}
                        onClick={loadAppointments}
                    >
                        Refresh Ledger
                    </Button>
                }
            />

            <Card className="overflow-hidden shadow-sm border border-neutral-100 dark:border-dark-border min-h-125">
                <div className="bg-neutral-50/50 dark:bg-dark-elevated/50 p-5 border-b border-neutral-100 dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {filterCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
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
                  px-2 py-0.5 rounded-full text-xs font-bold
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

                    <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-2 sm:items-center">
                        <select
                            value={urgencyFilter}
                            onChange={(e) => setUrgencyFilter(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            aria-label="Filter by urgency"
                        >
                            <option value="all">All Urgency</option>
                            <option value="normal">Normal</option>
                            <option value="emergency">Emergency</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            aria-label="Sort appointments"
                        >
                            <option value="latest">Latest to Oldest</option>
                            <option value="oldest">Oldest to Latest</option>
                        </select>

                        <div className="w-full sm:w-64">
                            <Input
                                icon={Search}
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    {filteredAppointments.length === 0 ? (
                        <div className="py-24">
                            <EmptyState
                                icon={FileText}
                                title="No appointments discovered"
                                description={
                                    searchQuery
                                        ? `No matching records found for \"${searchQuery}\".`
                                        : `No ${filterCategories.find((c) => c.id === activeTab)?.label.toLowerCase()} cases logged yet.`
                                }
                                action={
                                    searchQuery ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            Clear Search
                                        </Button>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table
                                columns={columns}
                                data={filteredAppointments}
                                striped
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export { AllAppointmentsPage };
export default AllAppointmentsPage;
