import { Table } from "../ui/Table";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Check, PencilLine, X, CheckCircle, Clock, ExternalLink } from "lucide-react";

const NormalQueueTable = ({
    appointments,
    onEditApprove,
    onApprove,
    onReject,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll,
}) => {
    const formatDoctorLabel = (rawName) => {
        const name = (rawName || "").trim();
        if (!name || name.toLowerCase() === "unassigned") return "Unassigned";
        if (/^dr\.?\s/i.test(name)) return name;
        return `Dr. ${name}`;
    };

    const formatDateIN = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const columns = [
        {
            key: "select",
            header: (
                <input
                    type="checkbox"
                    checked={
                        appointments.length > 0 &&
                        selectedIds.length === appointments.length
                    }
                    onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                />
            ),
            render: (_, apt) => {
                const id = apt._id || apt.appointmentId;
                return (
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={(e) => onToggleSelect?.(id, e.target.checked)}
                    />
                );
            },
        },
        {
            key: "patient",
            header: "Patient Name",
            render: (_, apt) => (
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                    {apt.patient?.name || apt.patientName || "Unknown"}
                </span>
            ),
        },
        {
            key: "doctor",
            header: "Assigned Doctor",
            render: (_, apt) => (
                <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    {formatDoctorLabel(apt.doctor?.name || apt.doctorName)}
                </span>
            ),
        },
        {
            key: "datetime",
            header: "Date & Slot",
            render: (_, apt) => (
                <div>
                    <div>
                        <span className="font-medium text-neutral-700 dark:text-neutral-200">
                            {formatDateIN(apt.date)}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-1.5">
                            • {apt.timeSlot}
                        </span>
                        {apt.slotBookingCount != null && (
                            <span className={`inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                                apt.slotBookingCount >= (apt.slotCapacity || 2)
                                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                            }`}>
                                {apt.slotBookingCount}/{apt.slotCapacity || 2}
                            </span>
                        )}
                    </div>
                    {apt.waitingTime && (
                        <div className="text-amber-600 dark:text-amber-500 text-xs mt-0.5 font-medium flex items-center">
                            Waiting: {apt.waitingTime}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            header: "Verification Status",
            render: (_, apt) => <Badge type="status" value={apt.status} />,
        },
        {
            key: "payment",
            header: "Payment",
            render: (_, apt) => {
                const p = apt.payment;
                if (!p) {
                    return (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            No record
                        </span>
                    );
                }
                if (p.status === "paid") {
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Paid ₹{p.amount ?? ""}
                            </span>
                            {p.razorpayPaymentId && (
                                <a
                                    href={`https://dashboard.razorpay.com/app/payments/${p.razorpayPaymentId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    {p.razorpayPaymentId.slice(0, 14)}…
                                </a>
                            )}
                        </div>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        {p.status === "created" ? "Pending" : p.status}
                    </span>
                );
            },
        },
        {
            key: "actions",
            header: "Administrator Action",
            className: "text-right",
            render: (_, apt) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        icon={X}
                        onClick={() => onReject(apt._id || apt.appointmentId)}
                        className="text-neutral-500 hover:text-red-600 border-neutral-200 hover:border-red-200 hover:bg-red-50"
                    >
                        Decline
                    </Button>
                    <Button
                        size="sm"
                        variant="success"
                        icon={PencilLine}
                        onClick={() => onEditApprove(apt)}
                    >
                        Edit & Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="success"
                        icon={Check}
                        onClick={() => onApprove?.(apt._id || apt.appointmentId)}
                    >
                        Approve
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="table-responsive">
            <Table columns={columns} data={appointments} striped />
        </div>
    );
};

export { NormalQueueTable };
export default NormalQueueTable;
