import {
  Inbox,
  Search,
  Calendar,
  MessageSquare,
  Users,
  FileX,
} from "lucide-react";

const icons = {
  inbox: Inbox,
  search: Search,
  calendar: Calendar,
  chat: MessageSquare,
  users: Users,
  file: FileX,
};

const EmptyState = ({
  icon = "inbox",
  title = "No data found",
  description = "",
  action,
  className = "",
}) => {
  const Icon = icons[icon] || Inbox;

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
};

export { EmptyState };
