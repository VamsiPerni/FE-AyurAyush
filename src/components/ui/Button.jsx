import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900 shadow-sm hover:shadow-md dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700',
  secondary: 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 dark:bg-dark-elevated dark:text-neutral-200 dark:border-dark-border dark:hover:bg-dark-hover',
  danger:    'bg-gradient-to-r from-error-600 to-error-700 text-white hover:from-error-700 hover:to-error-700 active:from-red-800 active:to-red-800 shadow-sm dark:from-error-500 dark:to-error-600',
  ghost:     'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-dark-elevated dark:active:bg-dark-hover',
  success:   'bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-green-700 hover:to-green-700 active:from-green-800 active:to-green-800 shadow-sm dark:from-success-500 dark:to-success-600',
  outline:   'bg-transparent text-neutral-700 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 dark:text-neutral-200 dark:border-dark-border dark:hover:bg-dark-elevated',
};

const sizes = {
  sm: 'h-8  px-3 text-xs  gap-1.5',
  md: 'h-10 px-4 text-sm  gap-2',
  lg: 'h-11 px-5 text-sm  gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
};

const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-4 h-4', xl: 'w-5 h-5' };

const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon: Icon, fullWidth = false, className = '', type = 'button', ...props
}, ref) => (
  <button
    ref={ref}
    type={type}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-200 ease-out
      focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
      dark:focus-visible:ring-offset-dark-surface
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      hover:scale-[1.02] active:scale-[0.98]
      ${variants[variant] || variants.primary} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
    {...props}
  >
    {loading
      ? <Loader2 className={`${iconSizes[size]} animate-spin`} />
      : Icon
        ? <Icon className={iconSizes[size]} />
        : null
    }
    {children}
  </button>
));
Button.displayName = 'Button';
export { Button };
export default Button;
