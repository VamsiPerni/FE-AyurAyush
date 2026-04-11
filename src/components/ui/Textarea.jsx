import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = forwardRef(({
  label, error, hint, required = false,
  id, rows = 4, className = '', containerClassName = '', ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-error-600 dark:text-error-400 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref} id={textareaId} rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2.5 bg-white dark:bg-dark-elevated border rounded-xl
          text-sm text-neutral-800 dark:text-neutral-100
          placeholder:text-neutral-400 dark:placeholder:text-neutral-500
          resize-y min-h-[80px]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-neutral-50 disabled:cursor-not-allowed
          dark:disabled:bg-dark-surface
          ${error
            ? 'border-error-300 focus:ring-error-600 bg-error-50/30 dark:border-error-600/50 dark:bg-error-900/10 dark:focus:ring-error-500'
            : 'border-neutral-200 focus:ring-primary-500 hover:border-neutral-300 dark:border-dark-border dark:hover:border-neutral-600 dark:focus:ring-primary-400'
          }
          ${className}
        `}
        {...props}
      />
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
Textarea.displayName = 'Textarea';
export { Textarea };
export default Textarea;
