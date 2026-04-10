import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
    Calendar,
    Clock,
    User,
    Hash,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Stethoscope,
    Activity,
    Pill,
} from "lucide-react";
import { doctorService } from "../../services/doctorService";
import { PageHeader } from "../../components/shared/PageHeader";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { AISummaryViewer } from "../../components/doctor/AISummaryViewer";
import { PrescriptionForm } from "../../components/doctor/PrescriptionForm";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const AppointmentDetailPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);
    const [chatSummary, setChatSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadAppointment = async () => {
        try {
            setLoading(true);
            setError("");
            // robust generic handler mirroring Patient view
            const fetchFn =
                doctorService.getAppointmentById ||
                doctorService.getAppointmentDetails;
            const result = await fetchFn(appointmentId);
            const payload = result?.data || result || null;
            const normalizedAppointment =
                payload?.appointment || payload || null;
            setAppointment(normalizedAppointment);
            setPatientDetails(
                payload?.patient || normalizedAppointment?.patient || null,
            );
            setChatSummary(payload?.chatDetails?.summary || null);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to load appointment details.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (appointmentId) {
            loadAppointment();
        }
    }, [appointmentId]);

    const handlePrescribe = async (payload) => {
        if (
            !window.confirm(
                "Are you sure you want to finalize this appointment? This action cannot be undone.",
            )
        )
            return;
        try {
            setSubmitting(true);
            // robust complete target mapping
            const completeFn =
                doctorService.addPrescription ||
                doctorService.completeAppointment;
            await completeFn(appointmentId, { prescription: payload });
            showSuccessToast(
                "Prescription saved and appointment completed successfully.",
            );
            await loadAppointment(); // Refresh state immediately natively
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to save prescription.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateIN = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // State: Loading
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Consultation Details"
                    backTo="/doctor/appointments"
                />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }

    // State: Error
    if (error) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Consultation Details"
                    backTo="/doctor/appointments"
                />
                <Card className="py-12">
                    <EmptyState
                        icon={AlertTriangle}
                        title="Failed to Load Record"
                        description={error}
                        action={
                            <Button onClick={loadAppointment}>
                                Retry Action
                            </Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    // State: Empty
    if (!appointment) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Consultation Details"
                    backTo="/doctor/appointments"
                />
                <Card className="py-12">
                    <EmptyState
                        icon={FileText}
                        title="Appointment Missing"
                        description="The consultation record cannot be located."
                        action={
                            <Button
                                onClick={() => navigate("/doctor/appointments")}
                            >
                                Browse Directory
                            </Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    const {
        status,
        urgencyLevel,
        tokenNumber,
        date,
        timeSlot,
        patient,
        patientName,
        aiSummary,
        prescription,
        symptoms,
    } = appointment;

    const resolvedPatient = patientDetails || patient;
    const name = resolvedPatient?.name || patientName || "Patient";
    const isEmergency = urgencyLevel === "emergency";
    const symptomList = Array.isArray(symptoms)
        ? symptoms
        : typeof symptoms === "string" && symptoms.trim()
          ? symptoms
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
          : [];
    const structuredSummary =
        chatSummary && typeof chatSummary === "object"
            ? chatSummary
            : aiSummary && typeof aiSummary === "object"
              ? aiSummary
              : null;
    const textSummary =
        !structuredSummary && typeof aiSummary === "string" ? aiSummary : "";

    // Spec Section 15 Rule 9 fallback
    const patientTokenSource =
        resolvedPatient?._id || resolvedPatient?.id || patient?._id || "";
    const tokenDisplay =
        tokenNumber ||
        `AYU-${new Date(date || Date.now()).toISOString().split("T")[0].replace(/-/g, "")}-PT${String(patientTokenSource).substring(0, 3) || "000"}-QUE`;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title={`${name}'s Consultation`}
                subtitle={`Scheduled for ${formatDateIN(date)}`}
                backTo="/doctor/appointments"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Core Record Meta */}
                <div className="lg:col-span-2 space-y-6">
                    <Card
                        className={
                            isEmergency
                                ? "border-red-200 border-2 shadow-sm"
                                : "shadow-sm"
                        }
                    >
                        {isEmergency && (
                            <div className="bg-red-50/80 px-5 py-3 border-b border-red-100 flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-semibold text-sm uppercase tracking-wide">
                                    Emergency Triage Prioritized
                                </span>
                            </div>
                        )}
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isEmergency ? "bg-red-100 text-red-600" : "bg-primary-50 text-primary-600"}`}
                                    >
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
                                            {name}
                                        </h2>
                                        <p className="text-sm text-neutral-500 font-medium">
                                            Verified Patient
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        {isEmergency && (
                                            <Badge
                                                type="status"
                                                value="emergency"
                                            />
                                        )}
                                        <Badge type="status" value={status} />
                                    </div>
                                    <div className="bg-neutral-100 px-3 py-1.5 rounded-md flex items-center gap-2 mt-1 border border-neutral-200 shadow-sm">
                                        <Hash className="w-4 h-4 text-neutral-500" />
                                        <span className="font-mono font-bold text-neutral-800 tracking-wider text-sm">
                                            {tokenDisplay}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isEmergency ? "bg-red-50/40" : "bg-neutral-50"}`}
                                >
                                    <Calendar
                                        className={`w-5 h-5 ${isEmergency ? "text-red-500" : "text-primary-600"}`}
                                    />
                                    <div>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-0.5">
                                            Date
                                        </p>
                                        <p className="font-bold text-neutral-800">
                                            {formatDateIN(date)}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isEmergency ? "bg-red-50/40" : "bg-neutral-50"}`}
                                >
                                    <Clock
                                        className={`w-5 h-5 ${isEmergency ? "text-red-500" : "text-primary-600"}`}
                                    />
                                    <div>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-0.5">
                                            Time Slot
                                        </p>
                                        <p className="font-bold text-neutral-800">
                                            {timeSlot}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI / Triage Summary Block */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-neutral-800 text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-600" />
                            Pre-Consultation Insights
                        </h3>

                        {structuredSummary ? (
                            <AISummaryViewer summary={structuredSummary} />
                        ) : textSummary ? (
                            <Card>
                                <CardContent className="p-5">
                                    <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                                        AI Consultation Notes
                                    </h4>
                                    <pre className="whitespace-pre-wrap text-sm text-neutral-700 leading-relaxed bg-neutral-50 border border-neutral-100 rounded-lg p-3">
                                        {textSummary}
                                    </pre>
                                </CardContent>
                            </Card>
                        ) : symptomList.length > 0 ? (
                            <Card>
                                <CardContent className="p-5">
                                    <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                                        Manually Reported Symptoms
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {symptomList.map((symptom, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-md border border-neutral-200"
                                            >
                                                {symptom}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 flex flex-col items-center justify-center text-neutral-500 text-center">
                                <FileText className="w-8 h-8 opacity-40 mb-2" />
                                <p className="text-sm max-w-sm">
                                    No initial symptoms or AI consultation
                                    summaries were recorded for this case.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Layer: Either Write Prescription or View Completed state */}
                    {status === "confirmed" && (
                        <div className="pt-6 border-t border-neutral-200 mt-8">
                            <h3 className="font-bold text-neutral-800 text-lg flex items-center gap-2 mb-4">
                                <Stethoscope className="w-5 h-5 text-primary-600" />
                                Clinical Diagnosis & Prescription
                            </h3>
                            <PrescriptionForm
                                onSubmit={handlePrescribe}
                                loading={submitting}
                            />
                        </div>
                    )}

                    {status === "completed" && prescription && (
                        <div className="pt-6 border-t border-neutral-200 mt-8">
                            <Card className="border-success-200 overflow-hidden shadow-sm">
                                <div className="bg-success-50 px-5 py-4 border-b border-success-100 flex items-center gap-3 text-success-800">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <h3 className="font-bold">
                                        Issued Digtal Prescription
                                    </h3>
                                </div>
                                <CardContent className="p-5 space-y-5">
                                    {prescription.medications &&
                                        prescription.medications.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide text-[11px]">
                                                    Authorized Medications
                                                </h4>
                                                <div className="space-y-3">
                                                    {prescription.medications.map(
                                                        (med, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-white border border-neutral-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                                                            >
                                                                <div>
                                                                    <p className="font-semibold text-neutral-800 text-sm">
                                                                        {
                                                                            med.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                                                                        {
                                                                            med.dosage
                                                                        }{" "}
                                                                        •{" "}
                                                                        {
                                                                            med.frequency
                                                                        }{" "}
                                                                        •{" "}
                                                                        {
                                                                            med.duration
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 text-[11px] font-bold tracking-wide uppercase bg-neutral-100 px-2 py-1 rounded text-neutral-600 w-fit">
                                                                    {med.instructions ||
                                                                        "As Directed"}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {prescription.notes && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-neutral-700 mb-1 uppercase tracking-wide text-[11px]">
                                                Clinical Notes
                                            </h4>
                                            <p className="text-sm text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                                {prescription.notes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Sidebar Status Info Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="bg-neutral-50 py-4 border-b border-neutral-100">
                            <CardTitle className="text-sm">
                                Patient Protocol Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-neutral-800">
                                            Checked In
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            Identity verified
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${["confirmed", "completed"].includes(status) ? "bg-primary-50 text-primary-600" : "bg-neutral-100 text-neutral-400"}`}
                                    >
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-semibold ${["confirmed", "completed"].includes(status) ? "text-neutral-800" : "text-neutral-400"}`}
                                        >
                                            Consultation Phase
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {status === "confirmed"
                                                ? "Currently pending your review"
                                                : status === "completed"
                                                  ? "Finished"
                                                  : "Waiting for approval"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status === "completed" ? "bg-success-50 text-success-600" : "bg-neutral-100 text-neutral-400"}`}
                                    >
                                        <Pill className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-semibold ${status === "completed" ? "text-success-700" : "text-neutral-400"}`}
                                        >
                                            Discharged
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {status === "completed"
                                                ? "Prescription finalized"
                                                : "Pending completion"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export { AppointmentDetailPage };
export default AppointmentDetailPage;
