import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { AISummaryViewer } from "../../components/doctor/AISummaryViewer";
import { patientService } from "../../services/patientService";
import { paymentService } from "../../services/paymentService";
import { PaymentButton, PaymentPaidBadge } from "../../components/patient/PaymentButton";
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
    IndianRupee,
} from "lucide-react";

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const loadDetails = useCallback(async () => {
        try {
            setLoading(true);
            const [detailRes, paymentRes] = await Promise.allSettled([
                patientService.getAppointmentDetails(appointmentId),
                paymentService.getPaymentStatus(appointmentId),
            ]);
            if (detailRes.status === "fulfilled") setData(detailRes.value.data);
            else showErrorToast("Failed to load appointment details");
            if (paymentRes.status === "fulfilled") setPaymentStatus(paymentRes.value.data);
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

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
                <p className="text-neutral-500">Appointment not found</p>
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
    const isNotVisited = appointment.cancelledBy === "not_visited";

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/patient/appointments")}
                    className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Appointments</span>
                </button>
                <div className="flex items-center gap-2">
                    {appointment.urgencyLevel === "emergency" && (
                        <Badge type="status" value="emergency" />
                    )}
                    <Badge
                        type="status"
                        value={isNotVisited ? "no_show" : appointment.status}
                    />
                </div>
            </div>

            {/* Appointment Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Stethoscope size={16} className="text-primary-600" />
                        <span>
                            <span className="font-medium">Doctor:</span>{" "}
                            {doctor?.name || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <User size={16} className="text-neutral-400" />
                        <span>
                            <span className="font-medium">Specialization:</span>{" "}
                            {doctor?.specialization || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Calendar size={16} className="text-neutral-400" />
                        <span>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(appointment.date)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Clock size={16} className="text-neutral-400" />
                        <span>
                            <span className="font-medium">Time:</span>{" "}
                            {appointment.timeSlot}
                        </span>
                    </div>
                </div>

                {/* Payment Section */}
                {appointment.status === "confirmed" && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-dark-border">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <IndianRupee size={15} className="text-primary-600" />
                                <span className="font-medium">Consultation Fee:</span>
                                <span className="font-bold text-neutral-800 dark:text-neutral-100">
                                    ₹{doctor?.consultationFee ?? "—"}
                                </span>
                            </div>
                            {paymentStatus?.hasPaid ? (
                                <PaymentPaidBadge />
                            ) : (
                                <PaymentButton
                                    appointmentId={appointmentId}
                                    amount={doctor?.consultationFee}
                                    onSuccess={loadDetails}
                                />
                            )}
                        </div>
                    </div>
                )}

                {(appointment.status === "pending_admin_approval" ||
                    appointment.status === "confirmed") && (
                    <div className="mt-3">
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
                            <Pill size={18} className="text-primary-600" />
                            Prescription
                        </CardTitle>
                    </CardHeader>

                    {prescription.diagnosis && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Diagnosis:
                            </span>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                {prescription.diagnosis}
                            </p>
                        </div>
                    )}

                    {prescription.medications?.length > 0 && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                                Medications:
                            </span>
                            <div className="space-y-2">
                                {prescription.medications.map((med, i) => (
                                    <div
                                        key={i}
                                        className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/40 rounded-lg p-3 text-sm"
                                    >
                                        <p className="font-medium text-green-800 dark:text-green-300">
                                            {med.name}
                                        </p>
                                        <p className="text-green-600 dark:text-green-400">
                                            {med.dosage} — {med.frequency} —{" "}
                                            {med.duration}
                                        </p>
                                        {med.instructions && (
                                            <p className="text-neutral-500 text-xs mt-1">
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
                            <span className="text-sm font-medium text-neutral-700 block mb-2">
                                Tests Recommended:
                            </span>
                            <div className="space-y-2">
                                {prescription.tests.map((test, i) => (
                                    <div
                                        key={i}
                                        className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700/40 rounded-lg p-3 text-sm"
                                    >
                                        <p className="font-medium text-blue-800 dark:text-blue-300">
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
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Doctor's Notes:
                            </span>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 bg-neutral-50 dark:bg-dark-elevated p-3 rounded-lg">
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
                            <FileText size={18} className="text-primary-600" />
                            Doctor's Notes
                        </CardTitle>
                    </CardHeader>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {appointment.doctorNotes}
                    </p>
                </Card>
            )}
        </div>
    );
};

export { AppointmentDetailsPage };
