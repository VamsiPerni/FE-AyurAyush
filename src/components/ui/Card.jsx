const Card = ({
  children, hoverable = false, urgent = false,
  selected = false, padding = 'md',
  className = '', onClick, ...props
}) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div
      className={`
        bg-white rounded-xl border
        ${paddings[padding]}
        ${urgent   ? 'border-error-200 bg-error-50/30' :
          selected ? 'border-primary-300 ring-1 ring-primary-200' :
                     'border-neutral-100 shadow-sm'}
        ${hoverable || onClick
          ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-200'
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
  <h3 className={`text-lg font-semibold text-neutral-800 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent };
export default Card;
