const badgeVariants = {
  pending_admin_approval: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  emergency: "bg-red-100 text-red-700 border-red-300",
  normal: "bg-teal-100 text-teal-800 border-teal-200",
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  danger: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  pending_admin_approval: "Pending Approval",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  emergency: "Emergency",
  normal: "Normal",
  active: "Active",
  pending: "Pending",
  approved: "Approved",
};

const Badge = ({ variant = "info", children, className = "", dot = false }) => {
  const text = children || statusLabels[variant] || variant;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeVariants[variant] || badgeVariants.info} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {text}
    </span>
  );
};

export { Badge };
