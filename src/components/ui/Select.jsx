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
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-error-600 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref} id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          className={`
            w-full h-10 px-3 pr-10 bg-white border rounded-lg
            text-sm text-neutral-800 appearance-none cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            ${error
              ? 'border-error-300 focus:ring-error-600'
              : 'border-neutral-200 focus:ring-primary-500 hover:border-neutral-300'
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
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
});
Select.displayName = 'Select';
export { Select };
export default Select;
