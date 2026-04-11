import { Inbox, Search, Calendar, MessageSquare, Users, FileX } from 'lucide-react';
import Button from './Button';

const icons = {
  inbox: Inbox,
  search: Search,
  calendar: Calendar,
  chat: MessageSquare,
  users: Users,
  file: FileX,
};

const EmptyState = ({ icon: IconProp, title, description, action, actionLabel, actionIcon, className = '' }) => {
  const Icon = typeof IconProp === 'string' ? (icons[IconProp] || Inbox) : (IconProp || null);

  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-neutral-100 dark:bg-dark-elevated rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-neutral-400 dark:text-neutral-500" />
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">{description}</p>
      )}
      {action && typeof action === 'function' && actionLabel && (
        <Button onClick={action} icon={actionIcon}>{actionLabel}</Button>
      )}
      {action && typeof action !== 'function' && action}
    </div>
  );
};
export { EmptyState };
export default EmptyState;
