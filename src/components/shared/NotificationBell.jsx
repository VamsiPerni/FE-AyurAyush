import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, X, CheckCircle, AlertCircle, AlertTriangle, Info, Zap, RefreshCw } from "lucide-react";
import { useAuthContext } from "../../contexts/AppContext";
import { notificationService } from "../../services/notificationService";

const STORAGE_KEY = "ayurayush_notif_last_seen";
const READ_IDS_KEY = "ayurayush_notif_read_ids";

const getReadIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem(READ_IDS_KEY) || "[]")); }
    catch { return new Set(); }
};

const saveReadIds = (set) => {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify([...set]));
};

const getNotifId = (n) => `${n.appointmentId}-${n.type}-${new Date(n.timestamp).getTime()}`;

const typeConfig = {
    success: { icon: CheckCircle,  color: "text-success-600",  bg: "bg-success-50 border-success-200",  label: "Success" },
    error:   { icon: AlertCircle,  color: "text-error-600",    bg: "bg-error-50 border-error-200",      label: "Alert" },
    warning: { icon: AlertTriangle,color: "text-warning-600",  bg: "bg-warning-50 border-warning-200",  label: "Warning" },
    info:    { icon: Info,         color: "text-primary-600",  bg: "bg-primary-50 border-primary-200",  label: "Info" },
    urgent:  { icon: Zap,          color: "text-red-600",      bg: "bg-red-50 border-red-200",          label: "Urgent" },
};

const timeAgo = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const NotificationBell = () => {
    const { activeRole, roles } = useAuthContext();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastSeen, setLastSeen] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? Number(stored) : 0;
    });
    const [readIds, setReadIds] = useState(() => getReadIds());

    const role = activeRole || (roles?.length === 1 ? roles[0] : null);

    const fetchNotifications = useCallback(async () => {
        if (!role) return;
        try {
            setLoading(true);
            let res;
            if (role === "patient") res = await notificationService.getPatientNotifications();
            else if (role === "doctor") res = await notificationService.getDoctorNotifications();
            else if (role === "admin" || role === "sub_admin") res = await notificationService.getAdminNotifications();
            else return;
            setNotifications(res?.data || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const isNotifUnread = (n) => {
        const id = getNotifId(n);
        return !readIds.has(id) && new Date(n.timestamp).getTime() > lastSeen;
    };

    const unreadCount = notifications.filter(isNotifUnread).length;

    const markAllRead = () => {
        const now = Date.now();
        setLastSeen(now);
        localStorage.setItem(STORAGE_KEY, String(now));
        // Also clear individual read IDs since all are now read
        const newSet = new Set();
        setReadIds(newSet);
        saveReadIds(newSet);
    };

    const markOneRead = (n) => {
        const id = getNotifId(n);
        const newSet = new Set(readIds);
        newSet.add(id);
        setReadIds(newSet);
        saveReadIds(newSet);
    };

    const drawer = open ? createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white dark:bg-dark-card h-full flex flex-col shadow-2xl animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-dark-border bg-white dark:bg-dark-card shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                            <Bell className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-100">Notifications</h2>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">Last 30 days</p>
                        </div>
                        {unreadCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchNotifications}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-dark-hover transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-primary-600 hover:underline font-semibold px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-dark-hover transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Notification list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-neutral-400">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-dark-elevated rounded-full flex items-center justify-center">
                                <Bell className="w-8 h-8 text-neutral-300" />
                            </div>
                            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No notifications yet</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">Activity from the last 30 days will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-50 dark:divide-dark-border">
                            {notifications.map((n, idx) => {
                                const cfg = typeConfig[n.type] || typeConfig.info;
                                const Icon = cfg.icon;
                                const isUnread = isNotifUnread(n);
                                return (
                                    <div
                                        key={`${n.appointmentId}-${idx}`}
                                        className={`flex gap-4 px-5 py-4 transition-colors ${
                                            isUnread
                                                ? "bg-primary-50/50 dark:bg-primary-900/10"
                                                : "hover:bg-neutral-50/60 dark:hover:bg-dark-hover"
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg}`}>
                                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold leading-tight ${
                                                    isUnread ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-300"
                                                }`}>
                                                    {n.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isUnread && (
                                                        <>
                                                            <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                                            <button
                                                                onClick={() => markOneRead(n)}
                                                                className="text-[10px] text-primary-600 hover:underline font-semibold whitespace-nowrap"
                                                                title="Mark as read"
                                                            >
                                                                Mark read
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5 font-medium">
                                                {timeAgo(n.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-elevated/30 shrink-0">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
                        Showing up to 50 notifications from the last 30 days
                    </p>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative p-2 rounded-xl text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-dark-hover transition-colors"
                aria-label="Open notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>
            {drawer}
        </>
    );
};

export { NotificationBell };
export default NotificationBell;
