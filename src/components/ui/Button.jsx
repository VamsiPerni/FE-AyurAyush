import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  secondary: 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100',
  danger:    'bg-error-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  ghost:     'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
  success:   'bg-success-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
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
      inline-flex items-center justify-center font-medium rounded-lg
      transition-all duration-200
      focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      ${variants[variant]} ${sizes[size]}
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
