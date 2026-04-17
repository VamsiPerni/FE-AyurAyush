import { forwardRef, useState, useId } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label, error, hint, required = false,
  type = 'text', id, icon: Icon,
  className = '', containerClassName = '', ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-error-600 dark:text-error-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full h-10 px-3 bg-white dark:bg-dark-elevated border rounded-xl
            text-sm text-neutral-800 dark:text-neutral-100
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            dark:disabled:bg-dark-surface
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error
              ? 'border-error-300 focus:ring-error-600 bg-error-50/30 dark:border-error-600/50 dark:bg-error-900/10 dark:focus:ring-error-500'
              : 'border-neutral-200 focus:ring-primary-500 hover:border-neutral-300 dark:border-dark-border dark:hover:border-neutral-600 dark:focus:ring-primary-400'
            }
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-error-600 dark:text-error-400 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
export { Input };
export default Input;
