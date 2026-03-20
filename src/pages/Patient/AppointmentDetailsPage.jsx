import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { AISummaryViewer } from "../../components/doctor/AISummaryViewer";
import { patientService } from "../../services/patientService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Stethoscope,
    FileText,
    Pill,
} from "lucide-react";

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadDetails();
    }, [appointmentId]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const result =
                await patientService.getAppointmentDetails(appointmentId);
            setData(result.data);
        } catch {
            showErrorToast("Failed to load appointment details");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setCancelling(true);
            await patientService.cancelAppointment(appointmentId);
            showSuccessToast("Appointment cancelled");
            navigate("/patient/appointments");
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to cancel");
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <LoadingSkeleton type="detail" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <p className="text-gray-500">Appointment not found</p>
                <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => navigate("/patient/appointments")}
                >
                    Back to Appointments
                </Button>
            </div>
        );
    }

    const appointment = data.appointment || data;
    const doctor = data.doctor || appointment.doctor;
    const chatSummary =
        data.chatSummary || appointment.chatSummary || appointment.aiSummary;
    const prescription = appointment.prescription;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/patient/appointments")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Appointments</span>
                </button>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            appointment.urgencyLevel === "emergency"
                                ? "emergency"
                                : "normal"
                        }
                    >
                        {appointment.urgencyLevel?.toUpperCase()}
                    </Badge>
                    <Badge variant={appointment.status} />
                </div>
            </div>

            {/* Appointment Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Stethoscope size={16} className="text-[#065A82]" />
                        <span>
                            <span className="font-medium">Doctor:</span>{" "}
                            {doctor?.name || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} className="text-gray-400" />
                        <span>
                            <span className="font-medium">Specialization:</span>{" "}
                            {doctor?.specialization || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(appointment.date)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>
                            <span className="font-medium">Time:</span>{" "}
                            {appointment.timeSlot}
                        </span>
                    </div>
                </div>

                {(appointment.status === "pending_admin_approval" ||
                    appointment.status === "confirmed") && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCancel}
                            loading={cancelling}
                        >
                            Cancel Appointment
                        </Button>
                    </div>
                )}
            </Card>

            {/* AI Summary */}
            {chatSummary && <AISummaryViewer summary={chatSummary} />}

            {/* Prescription */}
            {prescription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill size={18} className="text-[#065A82]" />
                            Prescription
                        </CardTitle>
                    </CardHeader>

                    {prescription.diagnosis && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">
                                Diagnosis:
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                                {prescription.diagnosis}
                            </p>
                        </div>
                    )}

                    {prescription.medications?.length > 0 && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700 block mb-2">
                                Medications:
                            </span>
                            <div className="space-y-2">
                                {prescription.medications.map((med, i) => (
                                    <div
                                        key={i}
                                        className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"
                                    >
                                        <p className="font-medium text-green-800">
                                            {med.name}
                                        </p>
                                        <p className="text-green-600">
                                            {med.dosage} — {med.frequency} —{" "}
                                            {med.duration}
                                        </p>
                                        {med.instructions && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                {med.instructions}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {prescription.tests?.length > 0 && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700 block mb-2">
                                Tests Recommended:
                            </span>
                            <div className="space-y-2">
                                {prescription.tests.map((test, i) => (
                                    <div
                                        key={i}
                                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"
                                    >
                                        <p className="font-medium text-blue-800">
                                            {test.testName}
                                        </p>
                                        {test.instructions && (
                                            <p className="text-blue-600 text-xs">
                                                {test.instructions}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {prescription.notes && (
                        <div>
                            <span className="text-sm font-medium text-gray-700">
                                Doctor's Notes:
                            </span>
                            <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-lg">
                                {prescription.notes}
                            </p>
                        </div>
                    )}
                </Card>
            )}

            {/* Doctor Notes */}
            {appointment.doctorNotes && !prescription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText size={18} className="text-[#065A82]" />
                            Doctor's Notes
                        </CardTitle>
                    </CardHeader>
                    <p className="text-sm text-gray-600">
                        {appointment.doctorNotes}
                    </p>
                </Card>
            )}
        </div>
    );
};

export { AppointmentDetailsPage };
