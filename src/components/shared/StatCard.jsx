const variants = {
  default: { iconBg: 'bg-primary-50', iconColor: 'text-primary-600' },
  success: { iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
  warning: { iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
  error:   { iconBg: 'bg-red-50',     iconColor: 'text-red-600' },
  info:    { iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
  purple:  { iconBg: 'bg-purple-50',  iconColor: 'text-purple-600' },
};

const trendColors = {
  up:      'text-green-600',
  down:    'text-red-600',
  neutral: 'text-neutral-500',
};

const StatCard = ({ label, value, subtitle, icon: Icon, variant = 'default', loading = false, onClick, trend, trendValue }) => {
  const v = variants[variant] || variants.default;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
          <div className="w-9 h-9 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-100 shadow-sm p-5
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 ${v.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-[18px] h-[18px] ${v.iconColor}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-800">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
        {trend && trendValue && (
          <span className={`text-xs font-medium ${trendColors[trend] || trendColors.neutral}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};
export { StatCard };
export default StatCard;
