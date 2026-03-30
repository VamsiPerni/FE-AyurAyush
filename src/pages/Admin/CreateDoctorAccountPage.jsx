import { useState } from "react";
import { useNavigate } from "react-router";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import PageHeader from "../../components/shared/PageHeader";
import { adminService } from "../../services/adminService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const initialForm = {
    name: "",
    email: "",
    phone: "",
    gender: "male",
    dob: "",
    qualification: "",
    specialization: "",
    experience: "",
    licenseNumber: "",
    consultationFee: "",
};

const CreateDoctorAccountPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                ...form,
                experience: Number(form.experience),
                consultationFee: form.consultationFee
                    ? Number(form.consultationFee)
                    : undefined,
            };

            await adminService.createDoctorAccount(payload);
            showSuccessToast(
                "Doctor account created. Onboarding email sent with temporary password.",
            );
            setForm(initialForm);
            navigate("/admin/doctors");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to create doctor account",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <PageHeader
                title="Create Doctor Account"
                subtitle="Admin onboarding for verified doctors"
            />
            <Card>
                <CardHeader>
                    <CardTitle>
                        Create Doctor Account (Admin Onboarding)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <Input
                            label="Full Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />
                        <Select
                            label="Gender"
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            required
                            options={[
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                                { value: "other", label: "Other" },
                            ]}
                        />

                        <Input
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={form.dob}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Qualification"
                            name="qualification"
                            value={form.qualification}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Specialization"
                            name="specialization"
                            value={form.specialization}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Experience (Years)"
                            name="experience"
                            type="number"
                            min="0"
                            value={form.experience}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="License Number"
                            name="licenseNumber"
                            value={form.licenseNumber}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Consultation Fee (optional)"
                            name="consultationFee"
                            type="number"
                            min="0"
                            value={form.consultationFee}
                            onChange={handleChange}
                        />

                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/admin/doctors")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                Create Doctor Account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export { CreateDoctorAccountPage };
