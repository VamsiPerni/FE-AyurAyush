import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
    Search,
    RefreshCw,
    AlertCircle,
    FileText,
    ChevronRight,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Calendar,
    AlertTriangle,
} from "lucide-react";
import { doctorService } from "../../services/doctorService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const LIMIT = 15;

const filterCategories = [
    { id: "all", label: "All" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "not_closed", label: "Not Closed" },
];

const AllAppointmentsPage = () => {
    const navigate = useNavigate();

    // Filter state
    const [activeTab, setActiveTab] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    // Data state
    const [appointments, setAppointments] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState({
        all: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        not_closed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // No-show modal
    const [noShowModal, setNoShowModal] = useState(false);
    const [noShowTarget, setNoShowTarget] = useState(null);
    const [noShowLoading, setNoShowLoading] = useState(false);

    // Debounce search
    const searchTimer = useRef(null);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, 400);
    };

    // Map tab → status param
    const tabToStatus = (tab) => {
        if (tab === "pending") return "pending_admin_approval";
        if (tab === "confirmed") return "confirmed";
        if (tab === "completed") return "completed";
        if (tab === "cancelled") return "cancelled";
        if (tab === "not_closed") return "not_closed";
        return "";
    };

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const isNotClosed = activeTab === "not_closed";
            const result = await doctorService.getAppointments({
                status: isNotClosed ? "confirmed" : tabToStatus(activeTab),
                date: dateFilter,
                urgencyLevel: urgencyFilter === "all" ? "" : urgencyFilter,
                patientName: debouncedSearch,
                page,
                limit: LIMIT,
                ...(isNotClosed ? { pastOnly: "true" } : {}),
            });
            const payload = result?.data || result || {};
            const list = payload.appointments || [
                ...(payload.emergencyAppointments || []),
                ...(payload.normalAppointments || []),
            ];
            setAppointments(list);
            setTotalCount(payload.totalCount || 0);
            setTotalPages(payload.totalPages || 1);
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to load appointments.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    }, [activeTab, dateFilter, urgencyFilter, debouncedSearch, page]);

    const loadCounts = useCallback(async () => {
        try {
            const [
                allRes,
                confirmedRes,
                completedRes,
                cancelledRes,
                notClosedRes,
            ] = await Promise.all([
                doctorService.getAppointments({ limit: 1, page: 1 }),
                doctorService.getAppointments({
                    status: "confirmed",
                    limit: 1,
                    page: 1,
                }),
                doctorService.getAppointments({
                    status: "completed",
                    limit: 1,
                    page: 1,
                }),
                doctorService.getAppointments({
                    status: "cancelled",
                    limit: 1,
                    page: 1,
                }),
                doctorService.getAppointments({
                    status: "confirmed",
                    pastOnly: "true",
                    limit: 1,
                    page: 1,
                }),
            ]);
            setCounts({
                all: allRes?.data?.totalCount || 0,
                confirmed: confirmedRes?.data?.totalCount || 0,
                completed: completedRes?.data?.totalCount || 0,
                cancelled: cancelledRes?.data?.totalCount || 0,
                not_closed: notClosedRes?.data?.totalCount || 0,
            });
        } catch {
            // silent — counts are non-critical
        }
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    useEffect(() => {
        loadCounts();
    }, [loadCounts]);

    // Reset to page 1 when filters change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
    };
    const handleUrgencyChange = (e) => {
        setUrgencyFilter(e.target.value);
        setPage(1);
    };
    const handleDateChange = (e) => {
        setDateFilter(e.target.value);
        setPage(1);
    };
    const clearFilters = () => {
        setActiveTab("all");
        setUrgencyFilter("all");
        setDateFilter("");
        setSearchQuery("");
        setDebouncedSearch("");
        setPage(1);
    };

    const formatDateIN = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleRowClick = (apt) => {
        const id = apt.appointmentId || apt._id;
        if (id)
            navigate(`/doctor/appointments/${id}`, {
                state: { from: "/doctor/appointments" },
            });
    };

    const handleNoShowSubmit = async () => {
        if (!noShowTarget) return;
        try {
            setNoShowLoading(true);
            const res = await doctorService.markNoShow(
                noShowTarget.appointmentId,
            );
            showSuccessToast(res?.message || "Appointment marked as No-Show.");
            setNoShowModal(false);
            setNoShowTarget(null);
            await Promise.all([loadAppointments(), loadCounts()]);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to mark No-Show.",
            );
        } finally {
            setNoShowLoading(false);
        }
    };

    const normalizeRow = (item = {}) => ({
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
        cancelledBy: item?.cancelledBy || null,
    });

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
            render: (_, row) =>
                activeTab === "not_closed" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Not Closed
                    </span>
                ) : row.cancelledBy === "not_visited" ? (
                    <Badge type="status" value="no_show">
                        No-Show
                    </Badge>
                ) : (
                    <Badge type="status" value={row.status} />
                ),
        },
        {
            key: "actions",
            label: "Action",
            className: "text-right",
            render: (_, row) => (
                <div className="flex justify-end gap-2">
                    {activeTab === "not_closed" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setNoShowTarget(row);
                                setNoShowModal(true);
                            }}
                            className="text-error-600 border-error-200 hover:bg-error-50"
                        >
                            Mark No-Show
                        </Button>
                    )}
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

    const hasActiveFilters =
        activeTab !== "all" ||
        urgencyFilter !== "all" ||
        dateFilter ||
        debouncedSearch;
    const normalizedRows = appointments.map(normalizeRow);

    if (loading && page === 1 && !hasActiveFilters) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="All Appointments"
                    subtitle="Fetching schedule history..."
                />
                <Card className="p-6">
                    <TableSkeleton rows={8} columns={6} />
                </Card>
            </div>
        );
    }

    if (error && appointments.length === 0) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to load appointments"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadAppointments}>
                            Retry
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
                subtitle={`${totalCount} total appointment${totalCount !== 1 ? "s" : ""}`}
                backTo="/doctor/dashboard"
                action={
                    <Button
                        variant="outline"
                        icon={RefreshCw}
                        onClick={loadAppointments}
                    >
                        Refresh
                    </Button>
                }
            />

            <Card className="overflow-hidden shadow-sm border border-neutral-100 dark:border-dark-border">
                {/* Filter bar */}
                <div className="bg-neutral-50/50 dark:bg-dark-elevated/50 p-5 border-b border-neutral-100 dark:border-dark-border space-y-4">
                    {/* Status tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {filterCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleTabChange(cat.id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    activeTab === cat.id
                                        ? "bg-primary-600 text-white"
                                        : "bg-white dark:bg-dark-card text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover"
                                }`}
                            >
                                {cat.label}
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        activeTab === cat.id
                                            ? "bg-primary-500/30 text-white"
                                            : "bg-neutral-100 dark:bg-dark-elevated text-neutral-500 dark:text-neutral-400"
                                    }`}
                                >
                                    {counts[cat.id] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Patient name search */}
                        <div className="w-full sm:w-56">
                            <Input
                                icon={Search}
                                placeholder="Search patient name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="bg-white dark:bg-dark-card"
                            />
                        </div>

                        {/* Date filter */}
                        <div className="relative flex items-center">
                            <Calendar className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={handleDateChange}
                                className="pl-9 pr-3 h-10 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            />
                        </div>

                        {/* Urgency */}
                        <select
                            value={urgencyFilter}
                            onChange={handleUrgencyChange}
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                            <option value="all">All Urgency</option>
                            <option value="normal">Normal</option>
                            <option value="emergency">Emergency</option>
                        </select>

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                            >
                                Clear filters
                            </button>
                        )}

                        <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            {totalCount} result{totalCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full min-h-64">
                    {loading ? (
                        <div className="p-6">
                            <TableSkeleton rows={6} columns={6} />
                        </div>
                    ) : normalizedRows.length === 0 ? (
                        <div className="py-24">
                            <EmptyState
                                icon={FileText}
                                title="No appointments found"
                                description={
                                    hasActiveFilters
                                        ? "No records match the selected filters."
                                        : "No appointments logged yet."
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button
                                            variant="outline"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table
                                columns={columns}
                                data={normalizedRows}
                                striped
                            />
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-elevated/30">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Page {page} of {totalPages} &bull; {totalCount}{" "}
                            appointments
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {/* Page number pills */}
                            {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                    const p =
                                        Math.max(
                                            1,
                                            Math.min(totalPages - 4, page - 2),
                                        ) + i;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                                                p === page
                                                    ? "bg-primary-600 text-white border-primary-600"
                                                    : "border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-hover"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                },
                            )}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages}
                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* No-Show Confirmation Modal */}
            <Modal
                isOpen={noShowModal}
                onClose={() => !noShowLoading && setNoShowModal(false)}
                title="Mark as No-Show"
                size="sm"
            >
                <div className="space-y-4">
                    {noShowTarget && (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm">
                            <p className="font-semibold text-neutral-800">
                                {noShowTarget.patientName}
                            </p>
                            <p className="text-neutral-500">
                                {formatDateIN(noShowTarget.date)} &bull;{" "}
                                {noShowTarget.timeSlot}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-neutral-600">
                        This will cancel the appointment and send a cancellation
                        notification to the patient.
                    </p>
                    <div className="flex gap-3 pt-2 border-t border-neutral-100">
                        <Button
                            variant="outline"
                            onClick={() => setNoShowModal(false)}
                            disabled={noShowLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleNoShowSubmit}
                            loading={noShowLoading}
                            className="flex-1"
                        >
                            Confirm No-Show
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export { AllAppointmentsPage };
export default AllAppointmentsPage;
