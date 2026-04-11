import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = forwardRef(({
  label, error, hint, required = false,
  options = [], placeholder = 'Select an option',
  id, className = '', containerClassName = '', ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-error-600 dark:text-error-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref} id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          className={`
            w-full h-10 px-3 pr-10 bg-white dark:bg-dark-elevated border rounded-xl
            text-sm text-neutral-800 dark:text-neutral-100 appearance-none cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            dark:disabled:bg-dark-surface
            ${error
              ? 'border-error-300 focus:ring-error-600 dark:border-error-600/50 dark:focus:ring-error-500'
              : 'border-neutral-200 focus:ring-primary-500 hover:border-neutral-300 dark:border-dark-border dark:hover:border-neutral-600 dark:focus:ring-primary-400'
            }
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error-600 dark:text-error-400 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      )}
    </div>
  );
});
Select.displayName = 'Select';
export { Select };
export default Select;
