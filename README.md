# AyurAyush — Frontend Design Specification (Final)

> Paste this file at the start of EVERY Copilot/Codex session.
> This is the SINGLE SOURCE OF TRUTH for the UI.
> NO DARK MODE. NO UI LIBRARIES. ONE COMPONENT AT A TIME.

---

## 1) Project Context

Hospital management system for Ayurveda and Panchakarma healthcare.
Three user roles: **Patient**, **Doctor**, **Admin**.

Design goal: Professional, calm, trustworthy. Think Zocdoc meets Ayurveda.
Spacious. Clean. Never cluttered. Never flashy.

**Tech stack — locked, do not change:**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Axios (withCredentials: true always)
- React Toastify
- Lucide React (icons only — no other icon library)
- No shadcn, MUI, Ant Design, Chakra
- No Framer Motion (CSS transitions only)
- No Redux, Zustand (Context API only)

---

## 2) Tailwind v4 Setup (Do This First — Critical)

### Step 1: Install
```bash
npm install tailwindcss @tailwindcss/vite
```

### Step 2: vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Step 3: src/index.css (exact code — do not modify)
```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

@theme {
  /* Font */
  --font-sans: 'Plus Jakarta Sans', 'DM Sans', ui-sans-serif, system-ui, sans-serif;

  /* Primary — teal (Ayurveda inspired) */
  --color-primary-50:  #f0fdfa;
  --color-primary-100: #ccfbf1;
  --color-primary-200: #99f6e4;
  --color-primary-300: #5eead4;
  --color-primary-400: #2dd4bf;
  --color-primary-500: #14b8a6;
  --color-primary-600: #0d9488;
  --color-primary-700: #0f766e;
  --color-primary-800: #115e59;
  --color-primary-900: #134e4a;

  /* Neutral — warm gray (NOT cold blue-gray) */
  --color-neutral-50:  #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;

  /* Status semantic colors */
  --color-success-50:  #f0fdf4;
  --color-success-600: #16a34a;
  --color-warning-50:  #fffbeb;
  --color-warning-600: #d97706;
  --color-error-50:    #fef2f2;
  --color-error-300:   #fca5a5;
  --color-error-600:   #dc2626;
  --color-info-50:     #eff6ff;
  --color-info-600:    #2563eb;

  /* Shadows */
  --shadow-card:       0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --shadow-card-hover: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-modal:      0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@layer base {
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body { @apply bg-neutral-50 text-neutral-900 font-sans; }
  :focus-visible { @apply outline-none ring-2 ring-primary-500 ring-offset-2; }
  :focus:not(:focus-visible) { outline: none; }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #d6d3d1 transparent;
  }
  .scrollbar-thin::-webkit-scrollbar { width: 6px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #a8a29e; }

  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-none::-webkit-scrollbar { display: none; }

  .animate-fade-in  { animation: fade-in  0.2s ease-out; }
  .animate-scale-in { animation: scale-in 0.2s ease-out; }
  .animate-slide-up { animation: slide-up 0.25s ease-out; }
}
```

After this setup `bg-primary-600`, `text-neutral-700` etc. all work as Tailwind classes.
No `tailwind.config.js` needed in v4.

---

## 3) Design Tokens

### Typography
```
Font: Plus Jakarta Sans (loaded in index.css)
DO NOT USE: Inter, Roboto, Arial, system-ui, Poppins

Page title:    text-2xl font-bold tracking-tight
Section title: text-xl font-semibold
Card title:    text-lg font-semibold
Subsection:    text-base font-semibold
Body:          text-sm font-normal leading-relaxed
Caption:       text-xs font-medium
Tiny:          text-[11px] font-medium
```

### Spacing
Always use Tailwind scale. Never arbitrary values like `p-[13px]`.
```
Between form fields: space-y-4
Between sections:    space-y-8
Card padding:        p-5 or p-6
Page padding:        p-4 lg:p-8
Grid gaps:           gap-4 or gap-6
```

### Border Radius
```
Badge/tag:    rounded-md   (6px)
Button/input: rounded-lg   (8px)
Card:         rounded-xl   (12px)
Modal:        rounded-2xl  (16px)
Avatar:       rounded-full
```

### Z-Index Scale (never use arbitrary z values)
```
Dropdown:       z-10
Sticky header:  z-20
Sidebar:        z-40
Modal:          z-50
Toast:          z-[100]
```

### Responsive Breakpoints (mobile first always)
```
sm  640px  — two columns where appropriate
md  768px  — wider cards
lg  1024px — sidebar appears, main gets ml-64
xl  1280px — larger stat grids

Cards:   grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3
Stats:   grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4
Tables:  overflow-x-auto on mobile
Sidebar: hidden on mobile, fixed on lg+
Padding: p-4 on mobile, p-8 on lg+
```

---

## 4) UI Components (Full Code)

### 4.1 Button
```jsx
// src/components/ui/Button.jsx
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
export default Button;
```

### 4.2 Input
```jsx
// src/components/ui/Input.jsx
import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label, error, hint, required = false,
  type = 'text', id, icon: Icon,
  className = '', containerClassName = '', ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-error-600 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-neutral-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full h-10 px-3 bg-white border rounded-lg
            text-sm text-neutral-800 placeholder:text-neutral-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error
              ? 'border-error-300 focus:ring-error-600 bg-error-50/30'
              : 'border-neutral-200 focus:ring-primary-500 hover:border-neutral-300'
            }
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-error-600 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
```

### 4.3 Select
```jsx
// src/components/ui/Select.jsx — same pattern as Input but for <select>
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
    </div>
  );
});
Select.displayName = 'Select';
export default Select;
```

### 4.4 Textarea
```jsx
// src/components/ui/Textarea.jsx — same pattern
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
    </div>
  );
});
Textarea.displayName = 'Textarea';
export default Textarea;
```

### 4.5 Badge
```jsx
// src/components/ui/Badge.jsx
const statusConfig = {
  pending_admin_approval: { label: 'Pending Approval', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed:              { label: 'Confirmed',        className: 'bg-green-50 text-green-700 border-green-200' },
  completed:              { label: 'Completed',        className: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled:              { label: 'Cancelled',        className: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
  rejected:               { label: 'Rejected',         className: 'bg-red-50 text-red-700 border-red-200' },
  emergency:              { label: 'Emergency',        className: 'bg-red-50 text-red-700 border-red-200' },
};

const queueConfig = {
  normal:      { label: 'Normal',      className: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
  ayurveda:    { label: 'Ayurvedic',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  panchakarma: { label: 'Panchakarma', className: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const Badge = ({ type = 'status', value, size = 'md', className = '' }) => {
  const config = type === 'queue' ? queueConfig : statusConfig;
  const resolved = config[value] || { label: value, className: 'bg-neutral-50 text-neutral-600 border-neutral-200' };
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-semibold rounded-md border
      ${sizeClass} ${resolved.className} ${className}
    `}>
      {value === 'emergency' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {resolved.label}
    </span>
  );
};
export default Badge;
```

### 4.6 Card
```jsx
// src/components/ui/Card.jsx
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
export default Card;
```

### 4.7 Modal
```jsx
// src/components/ui/Modal.jsx
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };

const Modal = ({
  isOpen, onClose, title, description, children, footer,
  size = 'md', closeOnOverlay = true
}) => {
  const previousFocus = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div className={`
        relative bg-white rounded-2xl shadow-modal w-full ${sizes[size]}
        animate-scale-in
      `}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-100">
          <div>
            {title && <h2 id="modal-title" className="text-lg font-semibold text-neutral-800">{title}</h2>}
            {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -m-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
export default Modal;
```

### 4.8 Table
```jsx
// src/components/ui/Table.jsx
const Table = ({
  columns, data, onRowClick, loading = false,
  emptyTitle = 'No data found', emptyDescription = '', emptyIcon: EmptyIcon,
  className = '',
}) => (
  <div className={`bg-white rounded-xl border border-neutral-100 overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/50">
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  {EmptyIcon && (
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                      <EmptyIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-neutral-700">{emptyTitle}</p>
                  {emptyDescription && (
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs">{emptyDescription}</p>
                  )}
                </div>
              </td>
            </tr>
          ) : data.map((row, idx) => (
            <tr key={row._id || row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`
                ${onRowClick ? 'cursor-pointer hover:bg-primary-50/40 transition-colors' : ''}
              `}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 text-sm text-neutral-700">
                  {col.render ? col.render(row, idx) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export default Table;
```

### 4.9 Skeleton
```jsx
// src/components/ui/Skeleton.jsx
export const Skeleton = ({ className = '' }) => (
  <div className={`bg-neutral-200 rounded-lg animate-pulse ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-neutral-100 p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-md" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
    <div className="border-b border-neutral-100 bg-neutral-50/50 p-4 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
    </div>
    <div className="divide-y divide-neutral-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, j) => <Skeleton key={j} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
```

### 4.10 Spinner
```jsx
// src/components/ui/Spinner.jsx
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div
    className={`rounded-full border-neutral-200 border-t-primary-600 animate-spin ${sizes[size]} ${className}`}
    role="status" aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
    <Spinner size="lg" />
    <p className="text-sm text-neutral-500">{message}</p>
  </div>
);

export default Spinner;
```

### 4.11 EmptyState
```jsx
// src/components/ui/EmptyState.jsx
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, action, actionLabel, actionIcon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-neutral-400" />
      </div>
    )}
    <h3 className="text-base font-semibold text-neutral-700 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
    )}
    {action && actionLabel && (
      <Button onClick={action} icon={actionIcon}>{actionLabel}</Button>
    )}
  </div>
);
export default EmptyState;
```

---

## 5) Layout Components

### 5.1 Sidebar
```jsx
// src/components/shared/Sidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Sidebar = ({ links = [] }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, activeRole, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-neutral-100">
        <div>
          <h1 className="text-xl font-bold text-primary-600 tracking-tight">AyurAyush</h1>
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">
            {activeRole} Portal
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map(link => {
          const isActive = location.pathname === link.path ||
            link.matchPaths?.some(p => location.pathname.startsWith(p));
          return (
            <NavLink
              key={link.path}
              to={link.path}
              aria-current={isActive ? 'page' : undefined}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                }
              `}
            >
              <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-neutral-500 capitalize">{activeRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-md border border-neutral-100"
        aria-label="Open menu"
        aria-expanded={mobileOpen}
      >
        <Menu className="w-5 h-5 text-neutral-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-xl
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-100 flex-col z-40">
        <NavContent />
      </aside>
    </>
  );
};
export default Sidebar;
```

### 5.2 PrivateLayout
```jsx
// src/layouts/PrivateLayout.jsx
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Sidebar from '../components/shared/Sidebar';
import { PageLoader } from '../components/ui/Spinner';

const PrivateLayout = ({ requiredRole, links }) => {
  const { isAuthenticated, activeRole, loading, user } = useApp();
  const location = useLocation();

  if (loading) return <PageLoader message="Verifying session..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (!activeRole) return <Navigate to="/choose-role" replace />;
  if (requiredRole && activeRole !== requiredRole) {
    const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={routes[activeRole] || '/choose-role'} replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar links={links} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default PrivateLayout;
```

### 5.3 PublicLayout
```jsx
// src/layouts/PublicLayout.jsx
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { PageLoader } from '../components/ui/Spinner';

const PublicLayout = () => {
  const { isAuthenticated, activeRole, loading } = useApp();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (isAuthenticated && activeRole) {
    const from = location.state?.from?.pathname;
    const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={from || routes[activeRole]} replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};
export default PublicLayout;
```

### 5.4 PageHeader
```jsx
// src/components/shared/PageHeader.jsx
const PageHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 ${className}`}>
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
export default PageHeader;
```

### 5.5 StatCard
```jsx
// src/components/shared/StatCard.jsx
const StatCard = ({ label, value, subtitle, icon: Icon, variant = 'default', loading = false, onClick }) => {
  const variants = {
    default: { iconBg: 'bg-primary-50', iconColor: 'text-primary-600' },
    success: { iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
    warning: { iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
    error:   { iconBg: 'bg-red-50',     iconColor: 'text-red-600' },
  };
  const v = variants[variant];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
          <div className="w-9 h-9 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-100 shadow-sm p-5
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 ${v.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-[18px] h-[18px] ${v.iconColor}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-800">{value}</p>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
};
export default StatCard;
```

---

## 6) Feature Components

### 6.1 Patient — AppointmentCard
```jsx
// src/components/patient/AppointmentCard.jsx
import { Calendar, Clock, Hash, User } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const AppointmentCard = ({ appointment, onClick }) => {
  const { doctorId, date, timeSlot, status, queueType, tokenNumber, urgencyLevel } = appointment;
  return (
    <Card hoverable urgent={urgencyLevel === 'emergency'} onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-sm">
              Dr. {doctorId?.name || doctorId?.userId?.name || 'Unknown'}
            </p>
            <p className="text-xs text-neutral-500">{doctorId?.specialization || 'General'}</p>
          </div>
        </div>
        <Badge type="status" value={status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {timeSlot}
        </span>
      </div>
      {/* Token — ALWAYS show when available */}
      {tokenNumber && (
        <div className="bg-primary-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
          <span className="text-sm font-bold text-primary-700 font-mono">{tokenNumber}</span>
          <Badge type="queue" value={queueType} className="ml-auto" />
        </div>
      )}
    </Card>
  );
};
export default AppointmentCard;
```

### 6.2 Doctor — AISummaryViewer
```jsx
// src/components/doctor/AISummaryViewer.jsx
import { Sparkles, AlertTriangle } from 'lucide-react';

const AISummaryViewer = ({ summary }) => {
  if (!summary) return null;
  const { symptoms = [], severity = 0, urgencyLevel = 'normal', recommendedSpecialist = '', detailedSummary } = summary;
  const isUrgent = urgencyLevel === 'emergency' || severity >= 8;
  const barColor = severity >= 8 ? 'from-red-400 to-red-600' : severity >= 5 ? 'from-amber-400 to-orange-500' : 'from-green-400 to-emerald-500';

  return (
    <div className={`rounded-xl p-5 border ${isUrgent ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-br from-primary-50 to-emerald-50 border-primary-100'}`}>
      <div className="flex items-center gap-2 mb-4">
        {isUrgent ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Sparkles className="w-4 h-4 text-primary-600" />}
        <h3 className={`text-sm font-semibold ${isUrgent ? 'text-red-800' : 'text-primary-800'}`}>
          AI Pre-Consultation Summary
        </h3>
      </div>
      {/* Severity bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-neutral-600 mb-1.5">
          <span className="font-medium">Severity Score</span>
          <span className="font-bold text-neutral-800">{severity}/10</span>
        </div>
        <div className="h-2.5 bg-white/80 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
            style={{ width: `${Math.max(severity * 10, 5)}%` }} />
        </div>
      </div>
      {/* Symptoms */}
      {symptoms.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-600 mb-2">Reported Symptoms</p>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s, i) => (
              <span key={i} className="bg-white border border-primary-100 text-primary-700 text-xs px-2.5 py-1 rounded-md font-medium">{s}</span>
            ))}
          </div>
        </div>
      )}
      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/80 rounded-lg p-3">
          <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">Urgency</p>
          <p className={`text-sm font-bold ${urgencyLevel === 'emergency' ? 'text-red-700' : 'text-neutral-800'}`}>{urgencyLevel}</p>
        </div>
        <div className="bg-white/80 rounded-lg p-3">
          <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">Specialist</p>
          <p className="text-sm font-bold text-neutral-800">{recommendedSpecialist || 'General'}</p>
        </div>
      </div>
      {detailedSummary && (
        <div className="mt-4 bg-white/60 rounded-lg p-3">
          <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">Summary</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{detailedSummary}</p>
        </div>
      )}
    </div>
  );
};
export default AISummaryViewer;
```

### 6.3 Admin — Emergency Queue
```jsx
// src/components/admin/EmergencyQueueCard.jsx
import { AlertCircle, Clock } from 'lucide-react';
import Badge from '../ui/Badge';

const EmergencyQueueCard = ({ appointments = [], onSelect }) => {
  if (!appointments.length) return null;
  return (
    <div className="bg-red-50/50 border-2 border-red-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-base font-bold text-red-800">Emergency Queue</h2>
        <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {appointments.length} urgent
        </span>
      </div>
      <div className="space-y-2">
        {appointments.map(apt => (
          <div key={apt._id} onClick={() => onSelect(apt)}
            className="bg-white border border-red-100 rounded-lg p-4 hover:border-red-300 cursor-pointer transition-colors flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-800 text-sm truncate">
                {apt.patientId?.name || 'Unknown Patient'}
              </p>
              <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3" />{apt.timeSlot}
              </p>
            </div>
            <Badge type="status" value="emergency" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default EmergencyQueueCard;
```

---

## 7) Page Templates

### Auth page pattern
```jsx
<div className="w-full max-w-md">
  <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
    <div className="px-8 pt-8 pb-6 text-center border-b border-neutral-50">
      <h1 className="text-2xl font-bold text-primary-600 mb-1">AyurAyush</h1>
      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-[0.2em] mb-6">
        Healthcare Management
      </p>
      <h2 className="text-xl font-semibold text-neutral-800">Page Title</h2>
      <p className="text-sm text-neutral-500 mt-1">Subtitle</p>
    </div>
    <div className="p-8">
      <form className="space-y-4">
        {/* fields */}
        <Button type="submit" fullWidth loading={loading}>Submit</Button>
      </form>
    </div>
    <div className="px-8 pb-8 text-center">
      <p className="text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
      </p>
    </div>
  </div>
</div>
```

### Dashboard page state pattern
```jsx
// Always handle all 3 states
if (loading) return <StatsSkeleton />;        // or PageSkeleton
if (error)   return <EmptyState icon={AlertCircle} title="Failed to load" description={error} action={fetchData} actionLabel="Try again" />;
if (!data?.length) return <EmptyState icon={Inbox} title="No items yet" />;
return <ActualContent data={data} />;
```

### Chatbot page layout
```
┌────────────────────┐
│ Chat Header        │ sticky top, bg-white border-b
├────────────────────┤
│ Emergency Banner   │ conditional, bg-red-600 animate-pulse
├────────────────────┤
│                    │
│ Messages           │ flex-1 overflow-y-auto scrollbar-thin
│                    │
├────────────────────┤
│ Quick Chips        │ horizontal scroll, scrollbar-none
├────────────────────┤
│ Input + Send       │ sticky bottom, bg-white border-t
└────────────────────┘
```

Message bubbles:
```jsx
// User message
<div className="flex justify-end mb-4">
  <div className="bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed">
    {message}
  </div>
</div>

// AI message
<div className="flex justify-start mb-4">
  <div className="bg-white border border-neutral-100 text-neutral-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed shadow-sm">
    {message}
  </div>
</div>

// Typing indicator
<div className="flex justify-start mb-4">
  <div className="bg-white border border-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
    <div className="flex gap-1.5">
      <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
</div>
```

---

## 8) Form Patterns

### Single column (auth, simple)
```jsx
<form className="space-y-4">
  <Input label="Email" id="email" type="email" required error={errors.email} />
  <Input label="Password" id="password" type="password" required error={errors.password} />
  <Button type="submit" fullWidth loading={loading}>Sign In</Button>
</form>
```

### Two column (profile, admin)
```jsx
<form className="space-y-5">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Input label="First Name" id="firstName" required />
    <Input label="Last Name" id="lastName" required />
  </div>
  <Input label="Email" id="email" type="email" required />
  <Textarea label="Notes" id="notes" rows={4} />
  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button type="submit" loading={loading}>Save Changes</Button>
  </div>
</form>
```

---

## 9) AppContext
```jsx
// src/contexts/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [activeRole, setActiveRole]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    setLoading(true);
    const result = await authService.getMe();
    if (result.isSuccess) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      // Restore active role from sessionStorage
      const savedRole = sessionStorage.getItem('activeRole');
      if (savedRole && result.data.user.roles.includes(savedRole)) {
        setActiveRole(savedRole);
      } else if (result.data.user.roles.length === 1) {
        setActiveRole(result.data.user.roles[0]);
      }
    } else {
      setUser(null); setActiveRole(null); setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    if (result.isSuccess) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      if (result.data.user.roles.length === 1) {
        setActiveRole(result.data.user.roles[0]);
        sessionStorage.setItem('activeRole', result.data.user.roles[0]);
      }
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null); setActiveRole(null); setIsAuthenticated(false);
    sessionStorage.removeItem('activeRole');
  }, []);

  const selectRole = useCallback((role) => {
    setActiveRole(role);
    sessionStorage.setItem('activeRole', role);
  }, []);

  return (
    <AppContext.Provider value={{ user, activeRole, loading, isAuthenticated, login, logout, selectRole, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
```

---

## 10) API Integration

### Axios instance
```javascript
// src/axios/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
      if (!publicPaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
```

### Service pattern
```javascript
// Every service function — exact same pattern
export const getSomeData = async (params) => {
  try {
    const response = await axiosInstance.get('/endpoint', { params });
    return { isSuccess: true, data: response.data.data };
  } catch (error) {
    return {
      isSuccess: false,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};
```

### Component fetch pattern
```javascript
const [data, setData]       = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError]     = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  const result = await someService.getData();
  if (result.isSuccess) {
    setData(result.data);
  } else {
    setError(result.message);
    toast.error(result.message);
  }
  setLoading(false);
};

useEffect(() => { fetchData(); }, []);
```

---

## 11) Auth Flow

### After login
```javascript
const { roles, mustChangePassword } = response.data.user;

if (mustChangePassword) { navigate('/change-password'); return; }
if (roles.length > 1)   { navigate('/choose-role'); return; }

const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
selectRole(roles[0]);
navigate(routes[roles[0]]);
```

### Cookie rules
```
JWT is httpOnly — JavaScript CANNOT read it.
Always use GET /auth/me to check auth.
withCredentials: true on every request — already in axiosInstance.
Never store auth in localStorage.
```

---

## 12) Data Rules

```
Time slots:   "09:00 - 10:00"  (range with spaces — never "09:00" or "9:00-10:00")
Dates to API: "2026-03-28"     (ISO YYYY-MM-DD)
Dates to UI:  "28 Mar 2026"    (en-IN locale)
Token format: AYU-YYYYMMDD-DR{n}-{seq}  e.g. AYU-20260328-DR68-001
```

**Booking requires conversationId:**
Patient MUST complete AI chat before booking.
If no conversationId → redirect to `/patient/chatbot`.

---

## 13) Toast Rules

```javascript
import { toast } from 'react-toastify';

toast.success('Appointment booked successfully');
toast.error('Unable to book. Please try again.');    // NEVER raw API errors
toast.info('OTP sent to your email');
toast.warning('This action cannot be undone');
```

ToastContainer config in App.jsx:
```jsx
<ToastContainer
  position="top-right" autoClose={4000}
  hideProgressBar={false} newestOnTop closeOnClick
  pauseOnFocusLoss draggable={false} pauseOnHover
  theme="light"
  toastClassName="!rounded-lg !shadow-lg !font-sans"
  bodyClassName="!text-sm"
/>
```

---

## 14) Accessibility (Non-Negotiable)

```
1. All interactive elements keyboard accessible (Tab, Enter, Escape)
2. All icons used as buttons must have aria-label
3. All inputs must have associated <label> with htmlFor
4. Color is NEVER the only indicator — always add text or icon
5. Focus ring visible on all interactive elements (focus-visible:ring-2)
6. Modals trap focus and close on Escape
7. Use semantic HTML: <main> <nav> <header> <section>
8. aria-live="polite" on chat messages and queue counts
9. role="alert" on all error messages
10. Touch targets minimum 40px height (h-10 buttons)
```

---

## 15) Coding Rules (Non-Negotiable)

```
1.  Tailwind classes only — no inline styles, no CSS modules
2.  Lucide React only for icons — never other icon libraries
3.  All API calls in /services/ — never fetch inside components
4.  All axios uses axiosInstance — withCredentials already set
5.  Never hardcode colors — use Tailwind classes from this palette
6.  Always handle: loading → error → empty → data (4 states, not 3)
7.  Field-level errors on forms — not just toast
8.  Optional chaining always — value?.property
9.  Token number ALWAYS visible in appointment views
10. urgencyLevel === "emergency" ALWAYS gets red styling
11. One component per file
12. Arrow functions: const Component = () => {}
13. NO dark mode — never add dark: variants
14. NO console.log in committed code
15. NO localStorage for auth — use /auth/me always
16. Dates to user: en-IN locale ("28 Mar 2026")
17. Dates to API: ISO ("2026-03-28")
18. Times always range format: "09:00 - 10:00"
19. forwardRef on Input, Select, Textarea
20. forwardRef displayName always set
```

---

## 16) Folder Structure

```
src/
├── axios/
│   └── axiosInstance.js
├── components/
│   ├── ui/
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Select.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Spinner.jsx
│   │   ├── Table.jsx
│   │   └── Textarea.jsx
│   ├── patient/
│   │   ├── AppointmentCard.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── DoctorCard.jsx
│   │   ├── TimeSlotPicker.jsx
│   │   ├── TokenDisplay.jsx
│   │   └── TypingIndicator.jsx
│   ├── doctor/
│   │   ├── AISummaryViewer.jsx
│   │   ├── AppointmentRow.jsx
│   │   └── PrescriptionForm.jsx
│   ├── admin/
│   │   ├── EditAppointmentModal.jsx
│   │   ├── EmergencyQueueCard.jsx
│   │   └── NormalQueueTable.jsx
│   └── shared/
│       ├── PageHeader.jsx
│       ├── Sidebar.jsx
│       └── StatCard.jsx
├── contexts/
│   └── AppContext.jsx
├── hooks/
│   ├── useAppointments.js
│   ├── useAuth.js
│   ├── useChatbot.js
│   └── useDebounce.js
├── layouts/
│   ├── PrivateLayout.jsx
│   └── PublicLayout.jsx
├── pages/
│   ├── Auth/
│   │   ├── ChangePasswordPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   └── SignupPage.jsx
│   ├── Common/
│   │   ├── ChooseRolePage.jsx
│   │   ├── HomePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── Patient/
│   │   ├── AppointmentDetailPage.jsx
│   │   ├── BookAppointmentPage.jsx
│   │   ├── ChatbotPage.jsx
│   │   ├── MyAppointmentsPage.jsx
│   │   ├── PatientDashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── TreatmentOptionsPage.jsx
│   ├── Doctor/
│   │   ├── AllAppointmentsPage.jsx
│   │   ├── AppointmentDetailPage.jsx
│   │   ├── DoctorDashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── TodayAppointmentsPage.jsx
│   └── Admin/
│       ├── AdminDashboardPage.jsx
│       ├── AppointmentQueuesPage.jsx
│       ├── CreateDoctorPage.jsx
│       ├── DoctorApplicationsPage.jsx
│       ├── DoctorAvailabilityPage.jsx
│       ├── ManageDoctorsPage.jsx
│       └── OfflineBookingPage.jsx
├── routes/
│   └── AppRoutes.jsx
├── services/
│   ├── adminService.js
│   ├── authService.js
│   ├── chatService.js
│   ├── doctorService.js
│   ├── otpService.js
│   ├── patientService.js
│   └── treatmentService.js
├── utils/
│   ├── constants.js
│   ├── formatters.js
│   └── toastHelper.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## 17) How to Use With Copilot/Codex

### Start of every session
```
I am building AyurAyush HMS frontend.
Read and follow FRONTEND_SPEC.md exactly.
No dark mode. No UI libraries. One component at a time.
```

### Asking for a component
```
Build [ComponentName] for AyurAyush following FRONTEND_SPEC.md.
Role: [patient/doctor/admin]
Purpose: [what it does]
Props: [list them]
API: [service function if any]
Uses: [which ui/ components]
```

### Asking for a page
```
Build [PageName] page for AyurAyush following FRONTEND_SPEC.md.
Role: [patient/doctor/admin]
Purpose: [what this page shows]
APIs: [list endpoints]
Components: [list from spec]
States: loading, error, empty, data — handle all 4
```

### One at a time rule
Never ask for multiple components or pages at once.
Pattern: build one → test → next.

---

*Version: Final (merged from v1 + v2.0 + v3.0)*
*Last updated: March 27, 2026*
*Lock this. Only update when design decisions change.*