const statusConfig = {
    pending_payment: {
        label: "Awaiting Payment",
        className:
            "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700/50",
    },
    pending_admin_approval: {
        label: "Pending Approval",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50",
    },
    confirmed: {
        label: "Confirmed",
        className:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50",
    },
    completed: {
        label: "Completed",
        className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50",
    },
    cancelled: {
        label: "Cancelled",
        className:
            "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50",
    },
    not_visited: {
        label: "Not Visited",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50",
    },
    no_show: {
        label: "No-Show",
        className:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50",
    },
    rejected: {
        label: "Rejected",
        className:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50",
    },
    emergency: {
        label: "Emergency",
        className:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50",
    },
    active: {
        label: "Active",
        className:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50",
    },
    pending: {
        label: "Pending",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50",
    },
    approved: {
        label: "Approved",
        className:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50",
    },
    waiting: {
        label: "Waiting",
        className:
            "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50",
    },
    called: {
        label: "Notified",
        className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50",
    },
    in_consultation: {
        label: "In Consultation",
        className:
            "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700/50",
    },
    info: {
        label: "Info",
        className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50",
    },
    warning: {
        label: "Warning",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50",
    },
    success: {
        label: "Success",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50",
    },
};

const queueConfig = {
    normal: {
        label: "Normal",
        className:
            "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50",
    },
    ayurveda: {
        label: "Ayurvedic",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50",
    },
    panchakarma: {
        label: "Panchakarma",
        className:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700/50",
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
        className:
            "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50",
    };
    const sizeClass =
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
    const label = children || resolved.label;

    return (
        <span
            className={`
      inline-flex items-center gap-1.5 font-semibold rounded-lg border
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
