const variants = {
  default: { iconBg: 'bg-primary-50 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400' },
  success: { iconBg: 'bg-green-50 dark:bg-green-900/20',   iconColor: 'text-green-600 dark:text-green-400' },
  warning: { iconBg: 'bg-amber-50 dark:bg-amber-900/20',   iconColor: 'text-amber-600 dark:text-amber-400' },
  error:   { iconBg: 'bg-red-50 dark:bg-red-900/20',     iconColor: 'text-red-600 dark:text-red-400' },
  info:    { iconBg: 'bg-blue-50 dark:bg-blue-900/20',    iconColor: 'text-blue-600 dark:text-blue-400' },
  purple:  { iconBg: 'bg-purple-50 dark:bg-purple-900/20',  iconColor: 'text-purple-600 dark:text-purple-400' },
};

const trendColors = {
  up:      'text-green-600 dark:text-green-400',
  down:    'text-red-600 dark:text-red-400',
  neutral: 'text-neutral-500 dark:text-neutral-400',
};

const StatCard = ({ label, value, subtitle, icon: Icon, variant = 'default', loading = false, onClick, trend, trendValue }) => {
  const v = variants[variant] || variants.default;

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-neutral-100 dark:border-dark-border shadow-sm dark:shadow-dark-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 bg-neutral-200 dark:bg-dark-elevated rounded-lg animate-pulse" />
          <div className="w-9 h-9 bg-neutral-200 dark:bg-dark-elevated rounded-xl animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-neutral-200 dark:bg-dark-elevated rounded-lg animate-pulse mb-1" />
        <div className="h-3 w-24 bg-neutral-200 dark:bg-dark-elevated rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-dark-card rounded-2xl border border-neutral-100 dark:border-dark-border shadow-sm dark:shadow-dark-card p-5
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 dark:hover:border-primary-700/50 dark:hover:shadow-dark-elevated' : 'hover:shadow-md dark:hover:shadow-dark-elevated'}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 ${v.iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-[18px] h-[18px] ${v.iconColor}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <p className="text-xs text-neutral-400 dark:text-neutral-500">{subtitle}</p>}
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
