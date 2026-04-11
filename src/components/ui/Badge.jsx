const statusConfig = {
    pending_admin_approval: {
        label: "Pending Approval",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-green-50 text-green-700 border-green-200",
    },
    completed: {
        label: "Completed",
        className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-neutral-50 text-neutral-600 border-neutral-200",
    },
    rejected: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
    },
    emergency: {
        label: "Emergency",
        className: "bg-red-50 text-red-700 border-red-200",
    },
    active: {
        label: "Active",
        className: "bg-green-50 text-green-700 border-green-200",
    },
    pending: {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    approved: {
        label: "Approved",
        className: "bg-green-50 text-green-700 border-green-200",
    },
    waiting: {
        label: "Waiting",
        className: "bg-neutral-50 text-neutral-600 border-neutral-200",
    },
    called: {
        label: "Notified",
        className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    in_consultation: {
        label: "In Consultation",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    info: {
        label: "Info",
        className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    warning: {
        label: "Warning",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    success: {
        label: "Success",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
};

const queueConfig = {
    normal: {
        label: "Normal",
        className: "bg-neutral-50 text-neutral-600 border-neutral-200",
    },
    ayurveda: {
        label: "Ayurvedic",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    panchakarma: {
        label: "Panchakarma",
        className: "bg-purple-50 text-purple-700 border-purple-200",
    },
};

const Badge = ({
    type = "status",
    value,
    variant,
    size = "md",
    dot = false,
    children,
    className = "",
}) => {
    const resolvedValue = value ?? variant ?? "info";
    const config = type === "queue" ? queueConfig : statusConfig;
    const resolved = config[resolvedValue] || {
        label: resolvedValue,
        className: "bg-neutral-50 text-neutral-600 border-neutral-200",
    };
    const sizeClass =
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
    const label = children || resolved.label;

    return (
        <span
            className={`
      inline-flex items-center gap-1.5 font-semibold rounded-md border
      ${sizeClass} ${resolved.className} ${className}
    `}
        >
            {(dot || resolvedValue === "emergency") && (
                <span
                    className={`w-1.5 h-1.5 rounded-full bg-current ${resolvedValue === "emergency" ? "animate-pulse" : ""}`}
                />
            )}
            {label}
        </span>
    );
};
export { Badge };
export default Badge;
