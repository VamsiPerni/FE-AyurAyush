import { useState, useEffect } from "react";
import {
    User,
    Phone,
    Calendar,
    Clock,
    Stethoscope,
    Mail,
    ShieldAlert,
    Activity,
    FileText,
    CheckCircle2,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const OfflineBookingPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        patientEmail: "",
        patientName: "",
        patientPhone: "",
        isEmergencyTriage: false,
        emergencyPatientName: "",
        emergencyPatientPhone: "",
        emergencyConditionSummary: "",
        emergencyWardLocation: "",
        doctorId: "",
        date: "",
        timeSlot: "",
        symptoms: "",
        adminNotes: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoadingDoctors(true);
                const result = await adminService.getDoctors();
                setDoctors(result.data?.doctors || result.data || []);
            } catch (err) {
                showErrorToast(
                    "Failed to load registered doctors. Please refresh.",
                );
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    // Fetch slots whenever doctor or date changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (
                formData.isEmergencyTriage ||
                !formData.doctorId ||
                !formData.date
            ) {
                setAvailableSlots([]);
                return;
            }

            try {
                setLoadingSlots(true);
                const result = await adminService.getDoctorAvailableSlots(
                    formData.doctorId,
                    formData.date,
                );

                // Handle array of strings or array of objects
                const slotsArray =
                    result.data?.availableSlots ||
                    result.data?.slots ||
                    result.data ||
                    [];
                setAvailableSlots(slotsArray);

                // Auto-clear selected slot if it's no longer in the fetched list
                setFormData((prev) => ({ ...prev, timeSlot: "" }));
            } catch (err) {
                setAvailableSlots([]);
                showErrorToast(
                    "Failed to retrieve available slots for the selected date.",
                );
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [formData.doctorId, formData.date]);

    const validateField = (field, value) => {
        switch (field) {
            case "patientName":
                return value.trim() ? "" : "Patient name is required";
            case "patientEmail":
                return value.trim() ? "" : "Patient email is required";
            case "patientPhone":
                return value.trim() ? "" : "Contact number is required";
            case "emergencyPatientName":
                return value.trim()
                    ? ""
                    : "Emergency patient name/label is required";
            case "doctorId":
                return value ? "" : "Please assign a doctor";
            case "date":
                return formData.isEmergencyTriage || value
                    ? ""
                    : "Appointment date is required";
            case "timeSlot":
                return formData.isEmergencyTriage || value
                    ? ""
                    : "A time slot must be selected";
            default:
                return "";
        }
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        const fields = formData.isEmergencyTriage
            ? ["emergencyPatientName", "doctorId"]
            : ["patientEmail", "doctorId", "date", "timeSlot"];

        fields.forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const payload = formData.isEmergencyTriage
                ? {
                      isEmergencyTriage: true,
                      doctorId: formData.doctorId,
                      emergencyPatientName: formData.emergencyPatientName,
                      emergencyPatientPhone: formData.emergencyPatientPhone,
                      emergencyConditionSummary:
                          formData.emergencyConditionSummary,
                      emergencyWardLocation: formData.emergencyWardLocation,
                      adminNotes: formData.adminNotes,
                  }
                : {
                      patientEmail: formData.patientEmail,
                      doctorId: formData.doctorId,
                      date: formData.date,
                      timeSlot: formData.timeSlot,
                      symptoms: formData.symptoms
                          ? formData.symptoms
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                          : [],
                      adminNotes: formData.adminNotes,
                  };

            await adminService.offlineBookAppointment(payload);
            showSuccessToast("Appointment booked successfully");

            // Reset Form payload explicitly
            setFormData({
                patientEmail: "",
                patientName: "",
                patientPhone: "",
                isEmergencyTriage: false,
                emergencyPatientName: "",
                emergencyPatientPhone: "",
                emergencyConditionSummary: "",
                emergencyWardLocation: "",
                doctorId: "",
                date: "",
                timeSlot: "",
                symptoms: "",
                adminNotes: "",
            });
            setAvailableSlots([]);
            setErrors({});
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to submit offline booking.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Date Constraints configurations
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const getMaxDateString = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split("T")[0];
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Offline Booking"
                subtitle="Book appointments for walk-in patients manually overriding digital constraints."
            />

            <Card className="border overflow-hidden shadow-sm transition-colors border-neutral-200 dark:border-dark-border">
                <CardContent className="p-6 sm:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                        noValidate
                    >
                        {/* Walk-in Identity Config */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2 text-neutral-400 border-neutral-100 dark:border-dark-border">
                                <User className="w-4 h-4" /> Patient Identity
                            </h3>

                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isEmergencyTriage}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isEmergencyTriage:
                                                    e.target.checked,
                                                date: e.target.checked
                                                    ? ""
                                                    : prev.date,
                                                timeSlot: e.target.checked
                                                    ? ""
                                                    : prev.timeSlot,
                                            }))
                                        }
                                        className="mt-1"
                                    />
                                    <span className="text-sm text-red-800">
                                        <strong>Emergency Triage Mode</strong> -
                                        bypasses date/time slot and creates
                                        immediate-priority emergency booking.
                                    </span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.isEmergencyTriage ? (
                                    <>
                                        <Input
                                            label="Emergency Patient Label"
                                            id="emergency-patient-name"
                                            icon={ShieldAlert}
                                            placeholder="e.g. Unknown Male - Road Accident"
                                            value={
                                                formData.emergencyPatientName
                                            }
                                            onChange={handleChange(
                                                "emergencyPatientName",
                                            )}
                                            error={errors.emergencyPatientName}
                                            required
                                        />

                                        <Input
                                            label="Emergency Contact Number (optional)"
                                            id="emergency-patient-phone"
                                            type="tel"
                                            icon={Phone}
                                            placeholder="e.g. 98xxxxxxxx"
                                            value={
                                                formData.emergencyPatientPhone
                                            }
                                            onChange={handleChange(
                                                "emergencyPatientPhone",
                                            )}
                                        />

                                        <Input
                                            label="Condition Summary"
                                            id="emergency-condition"
                                            icon={Activity}
                                            placeholder="e.g. Unconscious, head trauma"
                                            value={
                                                formData.emergencyConditionSummary
                                            }
                                            onChange={handleChange(
                                                "emergencyConditionSummary",
                                            )}
                                        />

                                        <Input
                                            label="Ward / Location"
                                            id="emergency-ward"
                                            icon={FileText}
                                            placeholder="e.g. ER Ward 2"
                                            value={
                                                formData.emergencyWardLocation
                                            }
                                            onChange={handleChange(
                                                "emergencyWardLocation",
                                            )}
                                        />
                                    </>
                                ) : (
                                    <Input
                                        label="Patient Email"
                                        id="walkin-email"
                                        type="email"
                                        icon={Mail}
                                        placeholder="e.g. patient@test.com"
                                        value={formData.patientEmail}
                                        onChange={handleChange("patientEmail")}
                                        error={errors.patientEmail}
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        {/* Clinical Parameters Configuration */}
                        <div className="space-y-6 pt-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2 text-neutral-400 border-neutral-100 dark:border-dark-border">
                                <FileText className="w-4 h-4" /> Consultation
                                Parameters
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Doctor Selection */}
                                <div className="md:col-span-2">
                                    <Select
                                        label="Assign Doctor"
                                        id="walkin-doctor"
                                        icon={Stethoscope}
                                        options={[
                                            {
                                                value: "",
                                                label: loadingDoctors
                                                    ? "Loading doctors..."
                                                    : "Select a practitioner...",
                                            },
                                            ...doctors.map((d) => ({
                                                value: d._id || d.doctorId,
                                                label: `Dr. ${d.name} (${d.specialization || "General"})`,
                                            })),
                                        ]}
                                        value={formData.doctorId}
                                        onChange={handleChange("doctorId")}
                                        error={errors.doctorId}
                                        required
                                    />
                                </div>

                                {/* Date & Slot Fetching Bindings */}
                                {!formData.isEmergencyTriage && (
                                    <Input
                                        label="Appointment Date"
                                        id="walkin-date"
                                        type="date"
                                        min={getTodayString()}
                                        max={getMaxDateString()}
                                        icon={Calendar}
                                        value={formData.date}
                                        onChange={handleChange("date")}
                                        error={errors.date}
                                        required
                                    />
                                )}

                                {!formData.isEmergencyTriage && (
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="walkin-time"
                                            className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                                        >
                                            Time Slot{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 text-neutral-400 pointer-events-none">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <select
                                                id="walkin-time"
                                                value={formData.timeSlot}
                                                onChange={handleChange(
                                                    "timeSlot",
                                                )}
                                                disabled={
                                                    !formData.doctorId ||
                                                    !formData.date ||
                                                    loadingSlots
                                                }
                                                className={`w-full pl-10 appearance-none bg-white dark:bg-dark-elevated border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors shadow-xs ${errors.timeSlot ? "border-red-300 ring-1 ring-red-300 bg-red-50/30 dark:bg-red-900/10" : "border-neutral-300 dark:border-dark-border"} ${!formData.doctorId || !formData.date ? "bg-neutral-100 dark:bg-dark-elevated cursor-not-allowed text-neutral-400" : "text-neutral-800 dark:text-neutral-100"}`}
                                            >
                                                <option value="">
                                                    {!formData.doctorId ||
                                                    !formData.date
                                                        ? "Select doctor & date first"
                                                        : loadingSlots
                                                          ? "Fetching slots..."
                                                          : availableSlots.length ===
                                                              0
                                                            ? "No slots available"
                                                            : "Select an available slot..."}
                                                </option>

                                                {availableSlots.map(
                                                    (slot, i) => {
                                                        const val =
                                                            typeof slot ===
                                                            "string"
                                                                ? slot
                                                                : slot.time ||
                                                                  slot.slot;
                                                        return (
                                                            <option
                                                                key={i}
                                                                value={val}
                                                            >
                                                                {val}
                                                            </option>
                                                        );
                                                    },
                                                )}
                                            </select>
                                            {/* Custom dropdown caret */}
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.timeSlot && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.timeSlot}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <Input
                                    label="Symptoms (comma separated, optional)"
                                    id="walkin-symptoms"
                                    icon={Activity}
                                    placeholder="e.g. fever, nausea"
                                    value={formData.symptoms}
                                    onChange={handleChange("symptoms")}
                                />

                                <Input
                                    label="Admin Notes (optional)"
                                    id="walkin-admin-notes"
                                    icon={FileText}
                                    placeholder="Any additional notes"
                                    value={formData.adminNotes}
                                    onChange={handleChange("adminNotes")}
                                />
                            </div>
                        </div>

                        {/* Validation & Submit Boundaries */}
                        <div className="pt-6 border-t flex items-center justify-end border-neutral-100 dark:border-dark-border">
                            <Button
                                type="submit"
                                icon={CheckCircle2}
                                loading={isSubmitting}
                                variant="primary"
                                className="w-full sm:w-auto px-8"
                            >
                                Confirm Offline Booking
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export { OfflineBookingPage };
export default OfflineBookingPage;
