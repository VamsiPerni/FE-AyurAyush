import { Table } from "../ui/Table";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Check, PencilLine, X } from "lucide-react";

const NormalQueueTable = ({
    appointments,
    onEditApprove,
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
