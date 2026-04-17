import { useState, useCallback, useEffect } from "react";
import { History, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { adminService } from "../../services/adminService";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { EmptyState } from "../ui/EmptyState";
import { TableSkeleton } from "../ui/Skeleton";
import { showSuccessToast, showErrorToast } from "../../utils/toastMessageHelper";

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const PastAppointmentsTab = () => {
    const [subTab, setSubTab] = useState("not_attended");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [attendedCount, setAttendedCount] = useState(0);
    const [notAttendedCount, setNotAttendedCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 15;

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [noShowModal, setNoShowModal] = useState(false);
    const [noShowTarget, setNoShowTarget] = useState(null);
    const [noShowReason, setNoShowReason] = useState("");
    const [noShowLoading, setNoShowLoading] = useState(false);

    const loadData = useCallback(async ({ silent = false, targetPage = 1 } = {}) => {
        try {
            if (!silent) setLoading(true);
            setError("");
            const params = { page: targetPage, limit: LIMIT };
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;

            const res = await adminService.getPastAppointments(params);
            const data = res?.data || {};
            setAppointments(data.appointments || []);
            setTotalCount(data.totalCount || 0);
            setAttendedCount(data.attendedCount || 0);
            setNotAttendedCount(data.notAttendedCount || 0);
            setPage(data.page || 1);
            setTotalPages(data.totalPages || 1);
        } catch {
            setError("Failed to load past appointments.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        loadData({ targetPage: 1 });
    }, [loadData]);

    const handlePageChange = (p) => {
        loadData({ targetPage: p });
    };

    const handleFilterApply = () => {
        loadData({ targetPage: 1 });
    };

    const handleFilterReset = () => {
        setFromDate("");
        setToDate("");
    };

    const openNoShowModal = (apt) => {
        setNoShowTarget(apt);
        setNoShowReason("");
        setNoShowModal(true);
    };

    const handleNoShowSubmit = async () => {
        if (!noShowReason.trim()) {
            showErrorToast("Please provide a reason for marking no-show.");
            return;
        }
        try {
            setNoShowLoading(true);
            const res = await adminService.markNoShow(noShowTarget.appointmentId, noShowReason);
            showSuccessToast(res?.message || "Appointment marked as no-show.");
            setNoShowModal(false);
            await loadData({ silent: true, targetPage: page });
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to mark no-show.");
        } finally {
            setNoShowLoading(false);
        }
    };

    const SUB_TABS = [
        { key: "not_attended", label: "Not Attended", icon: XCircle, count: notAttendedCount, color: "text-error-600" },
        { key: "attended",     label: "Attended",     icon: CheckCircle, count: attendedCount,    color: "text-success-600" },
    ];

    const parseSlotMinutes = (timeSlot) => {
        const start = String(timeSlot || "").split("-")[0].trim();
        const match = start.match(/(\d{1,2}):(\d{2})/);
        if (!match) return 0;
        return Number(match[1]) * 60 + Number(match[2]);
    };

    const displayList = appointments
        .filter((apt) => subTab === "attended" ? apt.attended : !apt.attended)
        .sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) return dateDiff;
            return parseSlotMinutes(b.timeSlot) - parseSlotMinutes(a.timeSlot);
        });

    return (
        <Card className="border-neutral-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-neutral-50/80 border-b border-neutral-100 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-neutral-600" />
                        <div>
                            <CardTitle className="text-neutral-800 tracking-tight">Past Appointments</CardTitle>
                            <p className="text-xs text-neutral-500 mt-0.5">All confirmed appointments whose date has passed</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => loadData({ targetPage: page })}>
                        Refresh
                    </Button>
                </div>

                {/* Sub-tab toggle */}
                <div className="flex gap-1 mt-4 border-b border-neutral-200">
                    {SUB_TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setSubTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                                subTab === t.key
                                    ? "border-primary-600 text-primary-700 bg-primary-50"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                            }`}
                        >
                            <t.icon className={`w-4 h-4 ${subTab === t.key ? "text-primary-600" : t.color}`} />
                            {t.label}
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                subTab === t.key ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"
                            }`}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">To</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                    </div>
                    <Button size="sm" onClick={handleFilterApply}>Apply</Button>
                    <Button size="sm" variant="outline" onClick={handleFilterReset} disabled={!fromDate && !toDate}>
                        Reset
                    </Button>
                    <span className="text-xs text-neutral-400 ml-auto">{totalCount} total records</span>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {loading ? (
                    <div className="p-6"><TableSkeleton rows={5} columns={6} /></div>
                ) : error ? (
                    <div className="py-16">
                        <EmptyState icon={AlertCircle} title="Failed to load" description={error}
                            action={<Button icon={RefreshCw} onClick={() => loadData()}>Retry</Button>}
                        />
                    </div>
                ) : displayList.length === 0 ? (
                    <div className="py-20">
                        <EmptyState
                            icon={subTab === "attended" ? CheckCircle : XCircle}
                            title={subTab === "attended" ? "No attended appointments" : "No no-show appointments"}
                            description={subTab === "attended"
                                ? "No past appointments have been marked as completed yet."
                                : "All past confirmed appointments were attended. Great work!"}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50/60 border-b border-neutral-100 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Patient</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Doctor</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Date</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Time Slot</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Payment</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Status</th>
                                    {subTab === "not_attended" && (
                                        <th className="px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {displayList.map((apt) => (
                                    <tr key={apt.appointmentId} className="border-b border-neutral-50 hover:bg-neutral-50/40 transition-colors">
                                        <td className="px-5 py-3 font-medium text-neutral-800">{apt.patientName}</td>
                                        <td className="px-5 py-3 text-neutral-600">Dr. {apt.doctorName}</td>
                                        <td className="px-5 py-3 text-neutral-700 font-semibold">{formatDate(apt.date)}</td>
                                        <td className="px-5 py-3 text-neutral-600">{apt.timeSlot}</td>
                                        <td className="px-5 py-3">
                                            {apt.payment ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-semibold text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded-md w-fit">
                                                        Paid ₹{apt.payment.amount}
                                                    </span>
                                                    {apt.payment.refundStatus !== "none" && (
                                                        <span className="text-xs text-neutral-500 capitalize">
                                                            Refund: {apt.payment.refundStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400">Unpaid</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge
                                                type="status"
                                                value={apt.attended ? "completed" : apt.queueStatus || "waiting"}
                                            />
                                        </td>
                                        {subTab === "not_attended" && (
                                            <td className="px-5 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openNoShowModal(apt)}
                                                    className="text-error-600 border-error-200 hover:bg-error-50"
                                                >
                                                    Mark No-Show
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/50">
                                <span className="text-xs text-neutral-500">
                                    Page {page} of {totalPages} &bull; {totalCount} records
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page <= 1}
                                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                                                    p === page
                                                        ? "bg-primary-600 text-white border-primary-600"
                                                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages}
                                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* No-Show Confirmation Modal */}
            <Modal
                isOpen={noShowModal}
                onClose={() => !noShowLoading && setNoShowModal(false)}
                title="Mark as No-Show"
                size="md"
            >
                <div className="space-y-4">
                    {noShowTarget && (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm">
                            <p className="font-semibold text-neutral-800">{noShowTarget.patientName}</p>
                            <p className="text-neutral-500">Dr. {noShowTarget.doctorName} &bull; {formatDate(noShowTarget.date)} &bull; {noShowTarget.timeSlot}</p>
                            {noShowTarget.payment && (
                                <p className="text-success-700 font-semibold mt-1">Paid ₹{noShowTarget.payment.amount} — refund will be initiated</p>
                            )}
                        </div>
                    )}
                    <p className="text-sm text-neutral-600">
                        This will cancel the appointment and send a cancellation notification to the patient
                        {noShowTarget?.payment ? ", and initiate a full refund." : "."}
                    </p>
                    <Textarea
                        label="Reason"
                        placeholder="E.g., Patient did not arrive despite being called twice..."
                        value={noShowReason}
                        onChange={(e) => setNoShowReason(e.target.value)}
                        disabled={noShowLoading}
                        required
                        rows={3}
                    />
                    <div className="flex gap-3 pt-2 border-t border-neutral-100">
                        <Button variant="outline" onClick={() => setNoShowModal(false)} disabled={noShowLoading} className="flex-1">
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleNoShowSubmit} loading={noShowLoading} className="flex-1">
                            Confirm No-Show
                        </Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export { PastAppointmentsTab };
export default PastAppointmentsTab;
