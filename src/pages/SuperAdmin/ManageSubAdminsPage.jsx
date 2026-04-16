import { useState, useEffect } from "react";
import {
    UserPlus, RefreshCw, AlertCircle, ShieldCheck,
    ShieldOff, PencilLine, CheckCircle, XCircle,
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { showErrorToast, showSuccessToast } from "../../utils/toastMessageHelper";

const QUEUE_SCOPES = ["all", "ayurveda", "panchakarma", "normal"];

const ALL_PERMISSIONS = [
    { key: "viewQueues", label: "View Queues" },
    { key: "approveAppointments", label: "Approve / Reject Appointments" },
    { key: "callPatients", label: "Call Patients" },
    { key: "manageAvailability", label: "Manage Doctor Availability" },
    { key: "viewDoctors", label: "View Doctors" },
    { key: "offlineBooking", label: "Offline Booking" },
    { key: "viewDoctorApplications", label: "View Doctor Applications" },
    { key: "viewRevenue", label: "View Revenue Dashboard" },
];

const SCOPE_PRESETS = {
    ayurveda: {
        queueScope: "ayurveda",
        permissions: { viewQueues: true, approveAppointments: true, callPatients: true, viewDoctors: true, manageAvailability: false, offlineBooking: false, viewDoctorApplications: false, viewRevenue: false },
    },
    panchakarma: {
        queueScope: "panchakarma",
        permissions: { viewQueues: true, approveAppointments: true, callPatients: true, viewDoctors: true, manageAvailability: true, offlineBooking: false, viewDoctorApplications: false, viewRevenue: false },
    },
    normal: {
        queueScope: "normal",
        permissions: { viewQueues: true, approveAppointments: true, callPatients: true, viewDoctors: true, manageAvailability: false, offlineBooking: true, viewDoctorApplications: false, viewRevenue: false },
    },
    all: {
        queueScope: "all",
        permissions: { viewQueues: true, approveAppointments: true, callPatients: true, viewDoctors: true, manageAvailability: true, offlineBooking: true, viewDoctorApplications: true, viewRevenue: false },
    },
};

const defaultPermissions = () =>
    Object.fromEntries(ALL_PERMISSIONS.map((p) => [p.key, false]));

const ManageSubAdminsPage = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [saving, setSaving] = useState(false);

    // Create form state
    const [form, setForm] = useState({
        name: "", email: "", phone: "", gender: "male",
        dob: "", queueScope: "all", permissions: defaultPermissions(), notes: "",
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        queueScope: "all", permissions: defaultPermissions(), notes: "", isActive: true,
    });

    const load = async () => {
        try {
            setLoading(true);
            const res = await superAdminService.listSubAdmins();
            setSubAdmins(res.data || []);
        } catch {
            showErrorToast("Failed to load sub-admins.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const applyPreset = (scope, setter) => {
        const preset = SCOPE_PRESETS[scope] || SCOPE_PRESETS.all;
        setter((prev) => ({ ...prev, queueScope: preset.queueScope, permissions: { ...defaultPermissions(), ...preset.permissions } }));
    };

    const handleCreate = async () => {
        if (!form.name || !form.email || !form.phone || !form.dob) {
            showErrorToast("Name, email, phone and date of birth are required.");
            return;
        }
        try {
            setSaving(true);
            const res = await superAdminService.createSubAdmin(form);
            showSuccessToast(`Sub-admin created! Temporary password: ${res.data.temporaryPassword}`);
            setCreateOpen(false);
            setForm({ name: "", email: "", phone: "", gender: "male", dob: "", queueScope: "all", permissions: defaultPermissions(), notes: "" });
            load();
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to create sub-admin.");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (sa) => {
        setEditTarget(sa);
        setEditForm({
            queueScope: sa.queueScope,
            permissions: { ...defaultPermissions(), ...sa.permissions },
            notes: sa.notes || "",
            isActive: sa.isActive,
        });
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            await superAdminService.updateSubAdmin(editTarget.profileId, editForm);
            showSuccessToast("Sub-admin updated successfully.");
            setEditOpen(false);
            load();
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to update sub-admin.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (profileId, name) => {
        if (!window.confirm(`Deactivate ${name}? They will lose all access immediately.`)) return;
        try {
            await superAdminService.deactivateSubAdmin(profileId);
            showSuccessToast("Sub-admin deactivated.");
            load();
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to deactivate.");
        }
    };

    const PermissionToggles = ({ permissions, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!permissions[key]}
                        onChange={(e) => onChange({ ...permissions, [key]: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                </label>
            ))}
        </div>
    );

    const scopeColor = (scope) => {
        if (scope === "ayurveda") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50";
        if (scope === "panchakarma") return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700/50";
        if (scope === "normal") return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50";
        return "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-400 dark:border-neutral-700/50";
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">
            <PageHeader
                title="Manage Sub-Admins"
                subtitle="Create and configure scoped admin accounts"
                backTo="/super-admin/dashboard"
                action={
                    <Button icon={UserPlus} onClick={() => setCreateOpen(true)}>
                        Create Sub-Admin
                    </Button>
                }
            />

            <Card className="shadow-sm">
                <CardHeader className="flex items-center justify-between border-b border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-elevated/50">
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary-600" />
                        Sub-Admin Accounts ({subAdmins.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} />
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6"><TableSkeleton rows={4} columns={5} /></div>
                    ) : subAdmins.length === 0 ? (
                        <div className="py-16">
                            <EmptyState
                                icon={ShieldCheck}
                                title="No sub-admins yet"
                                description="Create your first sub-admin to delegate queue management."
                                action={<Button icon={UserPlus} onClick={() => setCreateOpen(true)}>Create Sub-Admin</Button>}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-neutral-100 dark:border-dark-border text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-dark-elevated/30">
                                        <th className="py-3 px-4 font-medium">Name</th>
                                        <th className="py-3 px-4 font-medium">Email</th>
                                        <th className="py-3 px-4 font-medium">Queue Scope</th>
                                        <th className="py-3 px-4 font-medium">Permissions</th>
                                        <th className="py-3 px-4 font-medium">Status</th>
                                        <th className="py-3 px-4 font-medium">Created By</th>
                                        <th className="py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subAdmins.map((sa) => (
                                        <tr key={sa.profileId} className="border-b border-neutral-50 dark:border-dark-border last:border-0 hover:bg-neutral-50/50 dark:hover:bg-dark-hover transition-colors">
                                            <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-100">{sa.name}</td>
                                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{sa.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${scopeColor(sa.queueScope)}`}>
                                                    {sa.queueScope === "all" ? "All Queues" : sa.queueScope.charAt(0).toUpperCase() + sa.queueScope.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {ALL_PERMISSIONS.filter((p) => sa.permissions?.[p.key]).map((p) => (
                                                        <span key={p.key} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded font-medium">
                                                            {p.label}
                                                        </span>
                                                    ))}
                                                    {ALL_PERMISSIONS.filter((p) => sa.permissions?.[p.key]).length === 0 && (
                                                        <span className="text-xs text-neutral-400">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {sa.isActive ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                                                        <XCircle className="w-3.5 h-3.5" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 text-xs">{sa.createdBy}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" icon={PencilLine} onClick={() => openEdit(sa)}>
                                                        Edit
                                                    </Button>
                                                    {sa.isActive && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            icon={ShieldOff}
                                                            onClick={() => handleDeactivate(sa.profileId, sa.name)}
                                                        >
                                                            Deactivate
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Modal isOpen={createOpen} onClose={() => !saving && setCreateOpen(false)} title="Create Sub-Admin" size="lg">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                        <Input placeholder="Phone (10 digits)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                        <Input placeholder="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))} />
                        <select
                            value={form.gender}
                            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-neutral-700 dark:text-neutral-200"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Queue Scope</p>
                        <div className="flex flex-wrap gap-2">
                            {QUEUE_SCOPES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => applyPreset(s, setForm)}
                                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                                        form.queueScope === s
                                            ? "bg-primary-600 text-white border-primary-600"
                                            : "bg-white dark:bg-dark-card text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover"
                                    }`}
                                >
                                    {s === "all" ? "All Queues" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Selecting a scope applies a recommended permission preset. You can adjust below.</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Permissions</p>
                        <PermissionToggles
                            permissions={form.permissions}
                            onChange={(p) => setForm((prev) => ({ ...prev, permissions: p }))}
                        />
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-dark-border">
                        <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
                        <Button className="flex-1" onClick={handleCreate} loading={saving}>Create Sub-Admin</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={editOpen} onClose={() => !saving && setEditOpen(false)} title={`Edit — ${editTarget?.name}`} size="lg">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Queue Scope</p>
                        <div className="flex flex-wrap gap-2">
                            {QUEUE_SCOPES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => applyPreset(s, setEditForm)}
                                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                                        editForm.queueScope === s
                                            ? "bg-primary-600 text-white border-primary-600"
                                            : "bg-white dark:bg-dark-card text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover"
                                    }`}
                                >
                                    {s === "all" ? "All Queues" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Permissions</p>
                        <PermissionToggles
                            permissions={editForm.permissions}
                            onChange={(p) => setEditForm((prev) => ({ ...prev, permissions: p }))}
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
                            className="w-4 h-4 rounded accent-primary-600"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Account Active</span>
                    </label>

                    <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-dark-border">
                        <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
                        <Button className="flex-1" onClick={handleUpdate} loading={saving}>Save Changes</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export { ManageSubAdminsPage };
export default ManageSubAdminsPage;
