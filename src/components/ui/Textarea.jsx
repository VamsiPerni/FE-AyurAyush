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
        <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-error-600 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref} id={textareaId} rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2.5 bg-white border rounded-lg
          text-sm text-neutral-800 placeholder:text-neutral-400
          resize-y min-h-[80px]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-neutral-50 disabled:cursor-not-allowed
          ${error
            ? 'border-error-300 focus:ring-error-600 bg-error-50/30'
            : 'border-neutral-200 focus:ring-primary-500 hover:border-neutral-300'
          }
          ${className}
        `}
        {...props}
      />
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
Textarea.displayName = 'Textarea';
export { Textarea };
export default Textarea;
