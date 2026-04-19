import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
    ListOrdered,
    ShieldAlert,
    Clock,
    History,
    Stethoscope,
    ClipboardList,
    CalendarPlus,
    IndianRupee,
    AlertCircle,
    RefreshCw,
    UserCheck,
    CalendarCheck,
    AlertTriangle,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useAuthContext } from "../../contexts/AppContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { showErrorToast } from "../../utils/toastMessageHelper";

const SubAdminDashboardPage = () => {
    const navigate = useNavigate();
    const { name, subAdminProfile } = useAuthContext();
    const perms = subAdminProfile?.permissions || {};
    const scope = subAdminProfile?.queueScope || "all";

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await adminService.getSubAdminDashboard();
            if (res.isSuccess) {
                setStats(res.data || {});
            } else {
                setError(res.message || "Failed to load dashboard.");
                showErrorToast(res.message || "Failed to load dashboard.");
            }
        } catch {
            setError("Failed to load dashboard.");
            showErrorToast("Failed to load dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const scopeLabel =
        scope === "all" ? "All Queues" :
        scope.charAt(0).toUpperCase() + scope.slice(1);

    // Build stat cards based only on granted permissions
    const cards = [];

    if (perms.viewQueues) {
        cards.push({
            label: "Pending Approvals",
            value: stats?.pendingNormal ?? 0,
            icon: ListOrdered,
            variant: stats?.pendingNormal > 0 ? "warning" : "default",
            subtitle: "Normal appointments awaiting review",
            onClick: () => navigate("/admin/queues"),
        });
        cards.push({
            label: "Today's Confirmed",
            value: stats?.todayConfirmed ?? 0,
            icon: CalendarCheck,
            variant: "success",
            subtitle: "Confirmed appointments today",
            onClick: () => navigate("/admin/queues"),
        });
    }

    if (perms.viewEmergencyQueue) {
        cards.push({
            label: "Emergency Requests",
            value: stats?.pendingEmergency ?? 0,
            icon: ShieldAlert,
            variant: stats?.pendingEmergency > 0 ? "error" : "default",
            subtitle: "Urgent cases pending review",
            onClick: () => navigate("/admin/queues"),
        });
    }

    if (perms.viewOverdue) {
        cards.push({
            label: "Overdue Requests",
            value: stats?.overdue ?? 0,
            icon: Clock,
            variant: stats?.overdue > 0 ? "warning" : "default",
            subtitle: "Requests past their scheduled date",
            onClick: () => navigate("/admin/queues"),
        });
    }

    if (perms.viewPastAppointments) {
        cards.push({
            label: "Past — Not Attended",
            value: stats?.pastNotAttended ?? 0,
            icon: History,
            variant: "info",
            subtitle: "Past confirmed, not yet closed",
            onClick: () => navigate("/admin/queues"),
        });
        if (stats?.pastNotVisited > 0) {
            cards.push({
                label: "Doctor Flagged",
                value: stats.pastNotVisited,
                icon: AlertTriangle,
                variant: "warning",
                subtitle: "Flagged as not visited by doctor",
                onClick: () => navigate("/admin/queues"),
            });
        }
    }

    if (perms.viewDoctors) {
        cards.push({
            label: "Verified Doctors",
            value: stats?.totalDoctors ?? 0,
            icon: Stethoscope,
            variant: "default",
            subtitle: "Active verified practitioners",
            onClick: () => navigate("/admin/doctors"),
        });
    }

    if (perms.viewDoctorApplications) {
        cards.push({
            label: "Pending Applications",
            value: stats?.pendingApplications ?? 0,
            icon: ClipboardList,
            variant: stats?.pendingApplications > 0 ? "warning" : "default",
            subtitle: "Doctor applications awaiting review",
            onClick: () => navigate("/admin/doctor-applications"),
        });
    }

    if (perms.viewRevenue) {
        cards.push({
            label: "Today's Revenue",
            value: `₹${Number(stats?.todayRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            icon: IndianRupee,
            variant: "success",
            subtitle: "Payments collected today",
            onClick: () => navigate("/admin/revenue"),
        });
    }

    // Quick action buttons
    const actions = [];
    if (perms.offlineBooking) {
        actions.push({ label: "Offline Booking", icon: CalendarPlus, path: "/admin/offline-booking" });
    }
    if (perms.viewQueues || perms.viewEmergencyQueue) {
        actions.push({ label: "View Queues", icon: ListOrdered, path: "/admin/queues" });
    }
    if (perms.viewDoctors) {
        actions.push({ label: "Manage Doctors", icon: Stethoscope, path: "/admin/doctors" });
    }

    if (error) {
        return (
            <div className="py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to load dashboard"
                    description={error}
                    action={<Button icon={RefreshCw} onClick={loadDashboard}>Retry</Button>}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title={`Welcome, ${name || "Sub Admin"}`}
                subtitle={`Sub-Admin Dashboard — ${scopeLabel}`}
                action={
                    <Button variant="outline" icon={RefreshCw} onClick={loadDashboard} loading={loading}>
                        Refresh
                    </Button>
                }
            />

            {/* Scope banner */}
            <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                <UserCheck className="w-4 h-4 text-primary-600 shrink-0" />
                <p className="text-sm text-primary-700">
                    You are managing{" "}
                    <span className="font-semibold">{scopeLabel}</span>.
                    Only data within your assigned scope is shown.
                </p>
            </div>

            {/* Stat cards — only for granted permissions */}
            {cards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <StatCard
                            key={card.label}
                            label={card.label}
                            value={card.value}
                            icon={card.icon}
                            variant={card.variant}
                            subtitle={card.subtitle}
                            loading={loading}
                            onClick={card.onClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-12">
                    <EmptyState
                        icon={AlertCircle}
                        title="No permissions assigned"
                        description="Contact your administrator to grant you access to specific features."
                    />
                </div>
            )}

            {/* Quick actions */}
            {actions.length > 0 && (
                <div>
                    <h2 className="text-base font-semibold text-neutral-700 mb-3">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        {actions.map((action) => (
                            <Button
                                key={action.path}
                                variant="outline"
                                icon={action.icon}
                                onClick={() => navigate(action.path)}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export { SubAdminDashboardPage };
export default SubAdminDashboardPage;
