import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    Users, Stethoscope, CalendarCheck, Clock,
    IndianRupee, ShieldCheck, RefreshCw, AlertCircle,
    UserCog, TrendingUp,
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatsSkeleton } from "../../components/ui/Skeleton";
import { showErrorToast } from "../../utils/toastMessageHelper";

const SuperAdminDashboardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await superAdminService.getDashboard();
            if (res.isSuccess) {
                setData(res.data);
            } else {
                setError(res.message || "Failed to load super admin dashboard.");
                showErrorToast(res.message || "Failed to load super admin dashboard.");
            }
        } catch {
            setError("Failed to load super admin dashboard.");
            showErrorToast("Failed to load super admin dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader title="Super Admin Dashboard" subtitle="Loading system overview..." />
                <StatsSkeleton count={6} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to load dashboard"
                    description={error}
                    action={<Button icon={RefreshCw} onClick={load}>Retry</Button>}
                />
            </div>
        );
    }

    const stats = data?.stats || {};
    const queueTypes = data?.appointmentsByQueueType || {};
    const subAdmins = data?.subAdmins || [];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title="Super Admin Dashboard"
                subtitle="Full system overview — all operations, all queues, all revenue"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" icon={RefreshCw} onClick={load}>Refresh</Button>
                        <Button icon={UserCog} onClick={() => navigate("/super-admin/sub-admins")}>
                            Manage Sub-Admins
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers ?? 0} icon={Users} variant="default" />
                <StatCard label="Total Doctors" value={stats.totalDoctors ?? 0} icon={Stethoscope} variant="info" />
                <StatCard label="Total Patients" value={stats.totalPatients ?? 0} icon={Users} variant="default" />
                <StatCard label="Active Sub-Admins" value={stats.activeSubAdmins ?? 0} icon={ShieldCheck} variant="purple" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Today's Appointments" value={stats.todayAppointments ?? 0} icon={CalendarCheck} variant="success" />
                <StatCard label="Pending Approvals" value={stats.pendingApprovals ?? 0} icon={Clock} variant="warning" />
                <StatCard
                    label="Today's Revenue"
                    value={`₹${Number(stats.todayRevenue || 0).toLocaleString("en-IN")}`}
                    icon={IndianRupee}
                    variant="success"
                />
                <StatCard
                    label="Month Revenue"
                    value={`₹${Number(stats.monthRevenue || 0).toLocaleString("en-IN")}`}
                    icon={TrendingUp}
                    variant="info"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointments by Queue Type */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarCheck className="w-4 h-4 text-primary-600" />
                            Appointments by Queue Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { key: "ayurveda", label: "Ayurveda", color: "bg-emerald-500" },
                                { key: "panchakarma", label: "Panchakarma", color: "bg-purple-500" },
                                { key: "normal", label: "Normal Care", color: "bg-blue-500" },
                            ].map(({ key, label, color }) => {
                                const count = queueTypes[key] || 0;
                                const total = Object.values(queueTypes).reduce((a, b) => a + b, 0) || 1;
                                const pct = Math.round((count / total) * 100);
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">{count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-neutral-100 dark:bg-dark-elevated rounded-full overflow-hidden">
                                            <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Sub-Admins */}
                <Card className="shadow-sm">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary-600" />
                            Active Sub-Admins
                        </CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => navigate("/super-admin/sub-admins")}>
                            Manage
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {subAdmins.length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">
                                No sub-admins created yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {subAdmins.map((sa) => (
                                    <div key={sa.userId} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-dark-elevated border border-neutral-100 dark:border-dark-border">
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{sa.name}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{sa.email}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                            sa.queueScope === "ayurveda"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50"
                                                : sa.queueScope === "panchakarma"
                                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700/50"
                                                  : sa.queueScope === "normal"
                                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50"
                                                    : "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50"
                                        }`}>
                                            {sa.queueScope === "all" ? "All Queues" : sa.queueScope.charAt(0).toUpperCase() + sa.queueScope.slice(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export { SuperAdminDashboardPage };
export default SuperAdminDashboardPage;
