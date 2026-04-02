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
import { Badge } from "../../components/ui/Badge";
import PageHeader from "../../components/shared/PageHeader";
import { doctorService } from "../../services/doctorService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import {
    User,
    Mail,
    Phone,
    Stethoscope,
    GraduationCap,
    Briefcase,
    BadgeCheck,
    IndianRupee,
    Save,
    X,
    Pencil,
} from "lucide-react";

const DoctorProfilePage = () => {
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
            const result = await doctorService.getDoctorProfile();
            const data = result.data;
            setProfile(data);
            setForm({
                name: data.user?.name || "",
                phone: data.user?.phone || "",
                gender: data.user?.gender || "",
                dob: data.user?.dob ? data.user.dob.split("T")[0] : "",
                consultationFee: data.professional?.consultationFee || "",
                availableModes: (data.professional?.availableModes || []).join(
                    ", ",
                ),
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
                consultationFee: form.consultationFee
                    ? Number(form.consultationFee)
                    : undefined,
                availableModes: form.availableModes
                    ? form.availableModes
                          .split(",")
                          .map((m) => m.trim())
                          .filter(Boolean)
                    : [],
            };
            const result = await doctorService.updateDoctorProfile(payload);
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
            consultationFee: profile.professional?.consultationFee || "",
            availableModes: (profile.professional?.availableModes || []).join(
                ", ",
            ),
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

    const prof = profile?.professional || {};

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <PageHeader
                title="Doctor Profile"
                subtitle="Manage your personal and professional information"
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

            {/* Professional Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope size={18} className="text-success-600" />
                        Professional Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                <GraduationCap
                                    size={14}
                                    className="inline mr-1"
                                />
                                Specialization
                            </label>
                            <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                {prof.specialization || "Not set"}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                Qualification
                            </label>
                            <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                {prof.qualification || "Not set"}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                <Briefcase size={14} className="inline mr-1" />
                                Experience
                            </label>
                            <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                {prof.experience
                                    ? `${prof.experience} years`
                                    : "Not set"}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                <BadgeCheck size={14} className="inline mr-1" />
                                License Number
                            </label>
                            <p className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                                {prof.licenseNumber || "Not set"}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-neutral-700">
                                Verification Status
                            </label>
                            <div className="px-3 py-2">
                                <Badge
                                    variant={
                                        prof.isVerified ? "success" : "warning"
                                    }
                                >
                                    {prof.isVerified
                                        ? "Verified"
                                        : "Pending Verification"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editable Professional Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IndianRupee size={18} className="text-warning-600" />
                        Practice Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Consultation Fee"
                            name="consultationFee"
                            type="number"
                            value={form.consultationFee}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                            placeholder="e.g., 500"
                        />
                        <Input
                            label="Available Modes (comma-separated)"
                            name="availableModes"
                            value={form.availableModes}
                            onChange={handleChange}
                            readOnly={!editing}
                            disabled={!editing}
                            placeholder="e.g., in-person, video, phone"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export { DoctorProfilePage };
