import { useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ShieldCheck, CheckCircle, XCircle, ListOrdered } from "lucide-react";

const SubAdminDashboardPage = () => {
    const navigate = useNavigate();
    const { name, subAdminProfile } = useAuthContext();
    const subAdminName = name || "Sub Admin";
    const perms = subAdminProfile?.permissions || {};
    const scope = subAdminProfile?.queueScope || "all";

    const scopeLabel =
        scope === "all" ? "All Queues" :
        scope.charAt(0).toUpperCase() + scope.slice(1);

    const scopeColor =
        scope === "ayurveda"    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50" :
        scope === "panchakarma" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700/50" :
        scope === "normal"      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50" :
                                  "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50";

    const allPermissions = [
        { key: "viewQueues",             label: "View Queues" },
        { key: "approveAppointments",    label: "Approve / Reject Appointments" },
        { key: "callPatients",           label: "Call Patients" },
        { key: "manageAvailability",     label: "Manage Doctor Availability" },
        { key: "viewDoctors",            label: "View Doctors" },
        { key: "offlineBooking",         label: "Offline Booking" },
        { key: "viewDoctorApplications", label: "View Doctor Applications" },
        { key: "viewRevenue",            label: "View Revenue Dashboard" },
    ];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title={`Welcome, ${subAdminName}`}
                subtitle={`Sub-Admin Dashboard — Managing ${scopeLabel}`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scope card */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary-600" />
                            Your Queue Scope
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Assigned to manage:
                            </p>
                            <span className={`text-sm font-semibold px-3 py-1.5 rounded-lg border ${scopeColor}`}>
                                {scopeLabel}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                            You can only view and manage appointments within your assigned queue type.
                        </p>
                    </CardContent>
                </Card>

                {/* Quick actions */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListOrdered className="w-4 h-4 text-primary-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {perms.viewQueues && (
                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/queues")}>
                                    View Appointment Queues
                                </Button>
                            )}
                            {(perms.viewDoctors || perms.manageAvailability) && (
                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/doctors")}>
                                    View Doctors
                                </Button>
                            )}
                            {perms.offlineBooking && (
                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/offline-booking")}>
                                    Offline Booking
                                </Button>
                            )}
                            {perms.viewDoctorApplications && (
                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/doctor-applications")}>
                                    Doctor Applications
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Permissions overview */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Your Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {allPermissions.map((p) => {
                            const granted = !!perms[p.key];
                            return (
                                <div
                                    key={p.key}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                        granted
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300"
                                            : "bg-neutral-50 dark:bg-dark-elevated border-neutral-200 dark:border-dark-border text-neutral-400 dark:text-neutral-500"
                                    }`}
                                >
                                    {granted
                                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                                        : <XCircle className="w-4 h-4 shrink-0" />
                                    }
                                    <span className="text-sm font-medium">{p.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export { SubAdminDashboardPage };
export default SubAdminDashboardPage;
