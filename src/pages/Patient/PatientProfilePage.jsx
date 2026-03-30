import { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import PageHeader from "../../components/shared/PageHeader";
import { patientService } from "../../services/patientService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import {
    User,
    Mail,
    Droplets,
    FileText,
    ShieldAlert,
    Save,
    X,
    Pencil,
} from "lucide-react";

const PatientProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const result = await patientService.getPatientProfile();
            const data = result.data;
            setProfile(data);
            setForm({
                name: data.user?.name || "",
                phone: data.user?.phone || "",
                gender: data.user?.gender || "",
                dob: data.user?.dob ? data.user.dob.split("T")[0] : "",
                addresses: data.user?.addresses || [],
                bloodGroup: data.medical?.bloodGroup || "",
                allergies: (data.medical?.allergies || []).join(", "),
                medicalHistory: (data.medical?.medicalHistory || []).join(", "),
                emergencyContactName:
                    data.medical?.emergencyContact?.name || "",
                emergencyContactPhone:
                    data.medical?.emergencyContact?.phone || "",
                emergencyContactRelation:
                    data.medical?.emergencyContact?.relation || "",
            });
        } catch {
            showErrorToast("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                name: form.name,
                phone: form.phone,
                gender: form.gender,
                dob: form.dob || undefined,
                bloodGroup: form.bloodGroup || undefined,
                allergies: form.allergies
                    ? form.allergies
                          .split(",")
                          .map((a) => a.trim())
                          .filter(Boolean)
                    : [],
                medicalHistory: form.medicalHistory
                    ? form.medicalHistory
                          .split(",")
                          .map((h) => h.trim())
                          .filter(Boolean)
                    : [],
                emergencyContact: {
                    name: form.emergencyContactName,
                    phone: form.emergencyContactPhone,
                    relation: form.emergencyContactRelation,
                },
            };
            const result = await patientService.updatePatientProfile(payload);
            setProfile(result.data);
            setEditing(false);
            showSuccessToast("Profile updated successfully!");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to update profile",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({
            name: profile.user?.name || "",
            phone: profile.user?.phone || "",
            gender: profile.user?.gender || "",
            dob: profile.user?.dob ? profile.user.dob.split("T")[0] : "",
            addresses: profile.user?.addresses || [],
            bloodGroup: profile.medical?.bloodGroup || "",
            allergies: (profile.medical?.allergies || []).join(", "),
            medicalHistory: (profile.medical?.medicalHistory || []).join(", "),
            emergencyContactName: profile.medical?.emergencyContact?.name || "",
            emergencyContactPhone:
                profile.medical?.emergencyContact?.phone || "",
            emergencyContactRelation:
                profile.medical?.emergencyContact?.relation || "",
        });
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <LoadingSkeleton type="card" count={3} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <PageHeader
                title="My Profile"
                subtitle="Manage your personal and medical information"
                action={
                    !editing ? (
                        <Button
                            variant="secondary"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil size={14} />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={handleCancel}>
                                <X size={14} />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} loading={saving}>
                                <Save size={14} />
                                Save
                            </Button>
                        </div>
                    )
                }
            />

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User size={18} className="text-primary-600" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                <Mail size={14} className="inline mr-1" />
                                Email
                            </label>
                            <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                {profile?.user?.email || "N/A"}
                            </p>
                        </div>
                        <Input
                            label="Phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                        />
                        {editing ? (
                            <Select
                                label="Gender"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                placeholder="Select gender"
                                options={[
                                    { value: "male", label: "Male" },
                                    { value: "female", label: "Female" },
                                    { value: "other", label: "Other" },
                                ]}
                            />
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-neutral-700">
                                    Gender
                                </label>
                                <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600 capitalize">
                                    {form.gender || "Not set"}
                                </p>
                            </div>
                        )}
                        <Input
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={form.dob}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText size={18} className="text-success-600" />
                        Medical Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                <Droplets size={14} className="inline mr-1" />
                                MRN (Medical Record Number)
                            </label>
                            <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                {profile?.medical?.mrn || "Not assigned"}
                            </p>
                        </div>
                        {editing ? (
                            <Select
                                label="Blood Group"
                                name="bloodGroup"
                                value={form.bloodGroup}
                                onChange={handleChange}
                                placeholder="Select blood group"
                                options={[
                                    "A+",
                                    "A-",
                                    "B+",
                                    "B-",
                                    "AB+",
                                    "AB-",
                                    "O+",
                                    "O-",
                                ].map((bg) => ({ value: bg, label: bg }))}
                            />
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-neutral-700">
                                    Blood Group
                                </label>
                                <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                    {form.bloodGroup || "Not set"}
                                </p>
                            </div>
                        )}
                        <Input
                            label="Allergies (comma-separated)"
                            name="allergies"
                            value={form.allergies}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                            placeholder="e.g., Penicillin, Peanuts"
                        />
                        <Input
                            label="Medical History (comma-separated)"
                            name="medicalHistory"
                            value={form.medicalHistory}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                            placeholder="e.g., Diabetes, Hypertension"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert size={18} className="text-error-600" />
                        Emergency Contact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Contact Name"
                            name="emergencyContactName"
                            value={form.emergencyContactName}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                        />
                        <Input
                            label="Contact Phone"
                            name="emergencyContactPhone"
                            value={form.emergencyContactPhone}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                        />
                        <Input
                            label="Relation"
                            name="emergencyContactRelation"
                            value={form.emergencyContactRelation}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export { PatientProfilePage };
