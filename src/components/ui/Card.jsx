const Card = ({
  children, hoverable = false, urgent = false,
  selected = false, padding = 'md',
  className = '', onClick, ...props
}) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div
      className={`
        bg-white dark:bg-dark-card rounded-2xl border
        transition-all duration-300 ease-out
        ${paddings[padding]}
        ${urgent   ? 'border-error-300 bg-error-50/30 dark:border-error-700/50 dark:bg-error-900/10' :
          selected ? 'border-primary-300 ring-1 ring-primary-200 dark:border-primary-600 dark:ring-primary-800' :
                     'border-neutral-100 shadow-sm dark:border-dark-border dark:shadow-dark-card'}
        ${hoverable || onClick
          ? 'cursor-pointer hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 dark:hover:border-primary-700/50 dark:hover:shadow-dark-elevated'
          : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-neutral-800 dark:text-neutral-100 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent };
export default Card;
