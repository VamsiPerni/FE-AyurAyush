import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { patientService } from "../../services/patientService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/toastMessageHelper";
import {
  Stethoscope,
  GraduationCap,
  Award,
  Briefcase,
  FileText,
} from "lucide-react";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Orthopedic",
  "Dermatologist",
  "ENT Specialist",
  "Pediatrician",
  "Gynecologist",
  "Psychiatrist",
  "Dentist",
  "Ophthalmologist",
  "Gastroenterologist",
];

const ApplyDoctorRolePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    qualification: "",
    specialization: "",
    experience: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await patientService.applyDoctorRole({
        ...form,
        experience: Number(form.experience),
      });
      showSuccessToast("Application submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            Your doctor role application is pending admin review. You'll be
            notified once it's processed.
          </p>
          <Button onClick={() => navigate("/patient/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope size={20} className="text-[#065A82]" />
            Apply for Doctor Role
          </CardTitle>
        </CardHeader>

        <p className="text-sm text-gray-500 mb-6">
          Fill in your professional details to apply for a doctor role. Admin
          will review your application.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Qualification"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            placeholder="e.g., MBBS, MD"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Specialization <span className="text-red-500">*</span>
            </label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
            >
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Experience (years)"
            name="experience"
            type="number"
            value={form.experience}
            onChange={handleChange}
            placeholder="e.g., 5"
            min="0"
            required
          />

          <Input
            label="License Number"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            placeholder="Medical license number"
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Submit Application
          </Button>
        </form>
      </Card>
    </div>
  );
};

export { ApplyDoctorRolePage };
