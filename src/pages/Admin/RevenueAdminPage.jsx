import { useState, useEffect, useCallback } from "react";
import {
    IndianRupee,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    RotateCcw,
    BarChart2,
    CreditCard,
    ArrowDownLeft,
    Receipt,
} from "lucide-react";
import { paymentService } from "../../services/paymentService";
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
import { Modal } from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Textarea";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatsSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const paymentStatusConfig = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50",
    created: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50",
    failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50",
    refunded: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50",
};

const PaymentStatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${paymentStatusConfig[status] || paymentStatusConfig.created}`}
    >
        {status}
    </span>
);

const RevenueAdminPage = () => {
    const [data, setData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [refundModal, setRefundModal] = useState({ open: false, appointmentId: null, patientName: "" });
    const [refundReason, setRefundReason] = useState("");
    const [refunding, setRefunding] = useState(false);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await paymentService.getRevenueDashboard();
            setData(res.data);
        } catch {
            setError("Failed to load revenue data.");
            showErrorToast("Failed to load revenue data.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTransactions = useCallback(async () => {
        try {
            setTxLoading(true);
            const res = await paymentService.getAllTransactions({
                status: statusFilter,
                limit: 30,
            });
            setTransactions(res.data?.transactions || []);
        } catch {
            showErrorToast("Failed to load transactions.");
        } finally {
            setTxLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { loadDashboard(); }, [loadDashboard]);
    useEffect(() => { loadTransactions(); }, [loadTransactions]);

    const openRefund = (tx) => {
        setRefundModal({
            open: true,
            appointmentId: tx.appointment?.id,
            patientName: tx.patient?.name || "Patient",
        });
        setRefundReason("");
    };

    const handleRefund = async () => {
        if (!refundReason.trim()) {
            showErrorToast("Please provide a refund reason.");
            return;
        }
        try {
            setRefunding(true);
            await paymentService.initiateRefund(refundModal.appointmentId, refundReason);
            showSuccessToast("Refund initiated successfully.");
            setRefundModal({ open: false, appointmentId: null, patientName: "" });
            loadDashboard();
            loadTransactions();
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to initiate refund.");
        } finally {
            setRefunding(false);
        }
    };

    const summary = data?.summary || {};
    const maxDailyRevenue = Math.max(
        1,
        ...(data?.dailyRevenueLast30 || []).map((d) => d.revenue),
    );

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader title="Revenue Dashboard" subtitle="Loading financial data..." />
                <StatsSkeleton count={4} />
                <Card className="p-6"><TableSkeleton rows={5} columns={5} /></Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to load revenue data"
                    description={error}
                    action={<Button icon={RefreshCw} onClick={loadDashboard}>Retry</Button>}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title="Revenue Dashboard"
                subtitle="Track payments, refunds and platform earnings"
                action={
                    <Button variant="outline" icon={RefreshCw} onClick={() => { loadDashboard(); loadTransactions(); }}>
                        Refresh
                    </Button>
                }
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={`₹${fmt(summary.totalRevenue)}`}
                    icon={IndianRupee}
                    variant="success"
                    subtitle={`${summary.totalTransactions || 0} transactions`}
                />
                <StatCard
                    label="Today's Revenue"
                    value={`₹${fmt(summary.todayRevenue)}`}
                    icon={TrendingUp}
                    variant="info"
                    subtitle={`${summary.todayTransactions || 0} today`}
                />
                <StatCard
                    label="This Month"
                    value={`₹${fmt(summary.thisMonthRevenue)}`}
                    icon={BarChart2}
                    variant="default"
                    subtitle={`${summary.thisMonthTransactions || 0} transactions`}
                />
                <StatCard
                    label="Total Refunded"
                    value={`₹${fmt(summary.totalRefunded)}`}
                    icon={ArrowDownLeft}
                    variant="warning"
                    subtitle={`${summary.totalRefundCount || 0} refunds`}
                />
            </div>

            {/* Net Revenue Banner */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-600 dark:from-primary-900 dark:to-primary-800 rounded-2xl p-6 text-white shadow-md">
                <p className="text-primary-100 text-sm font-medium mb-1">Net Revenue (after refunds)</p>
                <p className="text-4xl font-bold tracking-tight">₹{fmt(summary.netRevenue)}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Revenue Chart (last 30 days) */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-primary-600" />
                            Daily Revenue — Last 30 Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(data?.dailyRevenueLast30 || []).length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">No revenue data yet.</p>
                        ) : (
                            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                                {(data?.dailyRevenueLast30 || []).map((d) => {
                                    const heightPct = Math.max(4, (d.revenue / maxDailyRevenue) * 100);
                                    return (
                                        <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[20px] group relative">
                                            <div
                                                className="w-full bg-primary-500 dark:bg-primary-600 rounded-t-sm hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors cursor-default"
                                                style={{ height: `${heightPct}%` }}
                                            />
                                            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                                                <div className="bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                                                    <p className="font-semibold">₹{fmt(d.revenue)}</p>
                                                    <p className="text-neutral-300">{d.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue by Payment Method */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary-600" />
                            By Payment Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(data?.revenueByMethod || []).length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">No data yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {(data?.revenueByMethod || []).map((m) => (
                                    <div key={m.method} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 capitalize">
                                                {m.method || "Unknown"}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{m.count} transactions</p>
                                        </div>
                                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">₹{fmt(m.total)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Doctor */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary-600" />
                        Revenue by Doctor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(data?.revenueByDoctor || []).length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">No data yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-neutral-100 dark:border-dark-border text-neutral-500 dark:text-neutral-400">
                                        <th className="py-2 pr-4 font-medium">Doctor</th>
                                        <th className="py-2 pr-4 font-medium">Transactions</th>
                                        <th className="py-2 font-medium">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.revenueByDoctor || []).map((d) => (
                                        <tr key={d.doctorId} className="border-b border-neutral-50 dark:border-dark-border last:border-0">
                                            <td className="py-2.5 pr-4 font-semibold text-neutral-800 dark:text-neutral-100">
                                                Dr. {d.doctorName}
                                            </td>
                                            <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-400">
                                                {d.transactionCount}
                                            </td>
                                            <td className="py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                                                ₹{fmt(d.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* All Transactions */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-elevated/50">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary-600" />
                        Transactions
                    </CardTitle>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                        <option value="">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="created">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </CardHeader>
                <CardContent className="p-0">
                    {txLoading ? (
                        <div className="p-6"><TableSkeleton rows={5} columns={5} /></div>
                    ) : transactions.length === 0 ? (
                        <div className="py-16">
                            <EmptyState icon={Receipt} title="No transactions found" description="No payment records match the selected filter." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-neutral-100 dark:border-dark-border text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-dark-elevated/30">
                                        <th className="py-3 px-4 font-medium">Patient</th>
                                        <th className="py-3 px-4 font-medium">Doctor</th>
                                        <th className="py-3 px-4 font-medium">Date & Slot</th>
                                        <th className="py-3 px-4 font-medium">Amount</th>
                                        <th className="py-3 px-4 font-medium">Method</th>
                                        <th className="py-3 px-4 font-medium">Status</th>
                                        <th className="py-3 px-4 font-medium">Paid At</th>
                                        <th className="py-3 px-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.paymentId} className="border-b border-neutral-50 dark:border-dark-border last:border-0 hover:bg-neutral-50/50 dark:hover:bg-dark-hover transition-colors">
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-100">{tx.patient?.name || "—"}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{tx.patient?.email}</p>
                                            </td>
                                            <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                                                Dr. {tx.doctor?.name || "—"}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                                                {tx.appointment?.date
                                                    ? new Date(tx.appointment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                    : "—"}
                                                {tx.appointment?.timeSlot && (
                                                    <p className="text-xs text-neutral-500">{tx.appointment.timeSlot}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-neutral-800 dark:text-neutral-100">
                                                ₹{fmt(tx.amount)}
                                                {tx.refundAmount && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-normal">
                                                        Refund: ₹{fmt(tx.refundAmount)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 capitalize">
                                                {tx.method || "—"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <PaymentStatusBadge status={tx.status} />
                                            </td>
                                            <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 text-xs">
                                                {tx.paidAt
                                                    ? new Date(tx.paidAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                                                    : "—"}
                                            </td>
                                            <td className="py-3 px-4">
                                                {tx.status === "paid" && tx.refundStatus === "none" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        icon={RotateCcw}
                                                        onClick={() => openRefund(tx)}
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700/50 dark:hover:bg-blue-900/20"
                                                    >
                                                        Refund
                                                    </Button>
                                                )}
                                                {tx.refundStatus === "initiated" && (
                                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Refund Initiated</span>
                                                )}
                                                {tx.refundStatus === "processed" && (
                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Refunded</span>
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

            {/* Refund Modal */}
            <Modal
                isOpen={refundModal.open}
                onClose={() => !refunding && setRefundModal({ open: false, appointmentId: null, patientName: "" })}
                title="Initiate Refund"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        You are initiating a full refund for{" "}
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {refundModal.patientName}
                        </span>
                        . This action cannot be undone.
                    </p>
                    <Textarea
                        placeholder="Reason for refund (e.g. Doctor unavailable, appointment cancelled)..."
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        disabled={refunding}
                        rows={3}
                    />
                    <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-dark-border">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setRefundModal({ open: false, appointmentId: null, patientName: "" })}
                            disabled={refunding}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            icon={RotateCcw}
                            className="flex-1"
                            onClick={handleRefund}
                            loading={refunding}
                        >
                            Confirm Refund
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export { RevenueAdminPage };
export default RevenueAdminPage;
