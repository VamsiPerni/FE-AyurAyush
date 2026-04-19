import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { AISummaryViewer } from "../../components/doctor/AISummaryViewer";
import { patientService } from "../../services/patientService";
import { paymentService } from "../../services/paymentService";
import {
    PaymentButton,
    PaymentPaidBadge,
} from "../../components/patient/PaymentButton";
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
    Download,
} from "lucide-react";
import { jsPDF } from "jspdf";

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
            if (paymentRes.status === "fulfilled")
                setPaymentStatus(paymentRes.value.data);
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

    const downloadPrescriptionPdf = () => {
        if (!prescription || appointment.status !== "completed") {
            showErrorToast(
                "Prescription PDF is available only for completed appointments.",
            );
            return;
        }

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 40;
        let cursorY = 52;

        doc.setFillColor(242, 247, 255);
        doc.roundedRect(marginX, 30, pageWidth - marginX * 2, 88, 10, 10, "F");

        doc.setTextColor(17, 52, 106);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("AyurAyush - Medical Prescription", marginX + 16, cursorY);

        doc.setFontSize(11);
        doc.setTextColor(62, 82, 120);
        doc.setFont("helvetica", "normal");
        doc.text(
            `Generated on ${new Date().toLocaleDateString("en-IN")}`,
            marginX + 16,
            cursorY + 20,
        );

        cursorY = 142;

        const drawMetaRow = (label, value, x, y) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(90, 100, 120);
            doc.text(`${label}:`, x, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(25, 25, 30);
            doc.text(String(value || "-"), x + 78, y);
        };

        drawMetaRow(
            "Patient",
            data?.patient?.name || "Patient",
            marginX,
            cursorY,
        );
        drawMetaRow("Doctor", doctor?.name || "N/A", marginX + 275, cursorY);
        drawMetaRow(
            "Date",
            formatDate(appointment.date),
            marginX,
            cursorY + 18,
        );
        drawMetaRow(
            "Time Slot",
            appointment.timeSlot || "-",
            marginX + 275,
            cursorY + 18,
        );
        drawMetaRow(
            "Appointment ID",
            appointment.id || appointmentId,
            marginX,
            cursorY + 36,
        );

        cursorY += 64;

        const drawSectionTitle = (title) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(17, 52, 106);
            doc.text(title, marginX, cursorY);
            cursorY += 10;
            doc.setDrawColor(220, 226, 238);
            doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
            cursorY += 18;
        };

        const writeParagraph = (text, indent = 0) => {
            const lines = doc.splitTextToSize(
                String(text || "-"),
                pageWidth - marginX * 2 - indent,
            );
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(33, 37, 45);
            doc.text(lines, marginX + indent, cursorY);
            cursorY += lines.length * 15 + 6;
        };

        if (prescription.diagnosis) {
            drawSectionTitle("Diagnosis");
            writeParagraph(prescription.diagnosis);
        }

        if (prescription.medications?.length) {
            drawSectionTitle("Medications");
            prescription.medications.forEach((med, idx) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(20, 60, 20);
                doc.text(
                    `${idx + 1}. ${med.name || "Medicine"}`,
                    marginX,
                    cursorY,
                );
                cursorY += 14;
                writeParagraph(
                    `${med.dosage || "-"}  |  ${med.frequency || "-"}  |  ${med.duration || "-"}`,
                    12,
                );
                if (med.instructions) {
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(10);
                    doc.setTextColor(98, 108, 126);
                    const instLines = doc.splitTextToSize(
                        `Instructions: ${med.instructions}`,
                        pageWidth - marginX * 2 - 12,
                    );
                    doc.text(instLines, marginX + 12, cursorY);
                    cursorY += instLines.length * 13 + 8;
                }
            });
        }

        if (prescription.tests?.length) {
            drawSectionTitle("Recommended Tests");
            prescription.tests.forEach((test, idx) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(24, 72, 140);
                doc.text(
                    `${idx + 1}. ${test.testName || "Test"}`,
                    marginX,
                    cursorY,
                );
                cursorY += 14;
                if (test.instructions) {
                    writeParagraph(test.instructions, 12);
                }
            });
        }

        if (prescription.notes) {
            drawSectionTitle("Doctor Notes");
            writeParagraph(prescription.notes);
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 128, 146);
        doc.text(
            "This is a digitally generated prescription from AyurAyush.",
            marginX,
            doc.internal.pageSize.getHeight() - 26,
        );

        const fileDate = new Date(appointment.date || Date.now())
            .toISOString()
            .slice(0, 10);
        const safeDoctor = String(doctor?.name || "doctor")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");
        doc.save(`AyurAyush_Prescription_${safeDoctor}_${fileDate}.pdf`);
        showSuccessToast("Prescription PDF downloaded.");
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
                                <IndianRupee
                                    size={15}
                                    className="text-primary-600"
                                />
                                <span className="font-medium">
                                    Consultation Fee:
                                </span>
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
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Pill size={18} className="text-primary-600" />
                                Prescription
                            </CardTitle>
                            {appointment.status === "completed" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon={Download}
                                    onClick={downloadPrescriptionPdf}
                                    className="border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-700/50 dark:text-primary-300 dark:hover:bg-primary-900/20"
                                >
                                    Download PDF
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    {appointment.status === "completed" ? (
                        <div className="mb-4 rounded-xl border border-primary-200/70 dark:border-primary-700/40 bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/10 dark:to-emerald-900/10 p-4">
                            <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                                Download Ready Prescription
                            </p>
                            <p className="text-xs text-primary-700/80 dark:text-primary-400 mt-1">
                                A neatly formatted PDF with diagnosis,
                                medications, tests, and doctor notes is
                                available for this completed appointment.
                            </p>
                        </div>
                    ) : null}

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
