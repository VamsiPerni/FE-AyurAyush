import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

const PageHeader = ({ title, subtitle, action, backTo, className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 ${className}`}>
      <div className="flex items-center gap-3">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="p-1.5 -ml-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-hover rounded-xl transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
export { PageHeader };
export default PageHeader;
