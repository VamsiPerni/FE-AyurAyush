const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-[3px]',
};

const colors = {
  primary: 'border-neutral-200 border-t-primary-600 dark:border-dark-border dark:border-t-primary-400',
  neutral: 'border-neutral-200 border-t-neutral-600 dark:border-dark-border dark:border-t-neutral-400',
  white:   'border-white/30 border-t-white',
};

const Spinner = ({ size = 'md', color = 'primary', className = '' }) => (
  <div
    className={`rounded-full animate-spin ${sizes[size]} ${colors[color]} ${className}`}
    role="status" aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-neutral-50 dark:bg-dark-surface flex flex-col items-center justify-center gap-4 transition-colors duration-300">
    <Spinner size="lg" />
    <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
  </div>
);

export { Spinner, PageLoader };
export default Spinner;
