import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
    Calendar,
    Clock,
    User,
    Hash,
    AlertTriangle,
    FileText,
    Activity,
    Pill,
    CheckCircle2,
    Stethoscope,
    ChevronRight,
} from "lucide-react";
import { patientService } from "../../services/patientService";
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
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const AppointmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const loadAppointment = async ({ silent = false } = {}) => {
        try {
            if (!silent) {
                setLoading(true);
                setError("");
            }
            // Using `getAppointmentDetails` per patientService schema
            const result = await patientService.getAppointmentDetails(id);
            setAppointment(result.data?.appointment || result.data || null);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to load appointment details.";
            if (!silent) {
                setError(message);
                showErrorToast(message);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (id) {
            loadAppointment();
        }
    }, [id]);

    useEffect(() => {
        if (!id) return undefined;

        const intervalId = setInterval(() => {
            loadAppointment({ silent: true });
        }, 20000);

        return () => clearInterval(intervalId);
    }, [id]);

    const handleCancelClick = async () => {
        if (
            !window.confirm("Are you sure you want to cancel this appointment?")
        )
            return;

        try {
            setCancelling(true);
            await patientService.cancelAppointment(id);
            showSuccessToast("Appointment cancelled successfully.");
            navigate("/patient/appointments");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to cancel appointment.",
            );
        } finally {
            setCancelling(false);
        }
    };

    // Safe formatting
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
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
                    title="Appointment Details"
                    backTo="/patient/appointments"
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
                    title="Appointment Details"
                    backTo="/patient/appointments"
                />
                <Card className="py-12">
                    <EmptyState
                        icon={AlertTriangle}
                        title="Failed to Load"
                        description={error}
                        action={
                            <Button onClick={loadAppointment}>Retry</Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    // State: Empty / Not Found
    if (!appointment) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Appointment Details"
                    backTo="/patient/appointments"
                />
                <Card className="py-12">
                    <EmptyState
                        icon={FileText}
                        title="Appointment Not Found"
                        description="The appointment you are looking for does not exist or has been removed."
                        action={
                            <Button
                                onClick={() =>
                                    navigate("/patient/appointments")
                                }
                            >
                                Back to Appointments
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
        queueAheadCount,
        date,
        timeSlot,
        doctor,
        doctorName,
        aiSummary,
        prescription,
        symptoms,
        consultationStartedAt,
        consultationEndedAt,
        consultationDurationSeconds,
    } = appointment;

    const formatTimeOnly = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDuration = (totalSeconds) => {
        const safe = Math.max(0, Number(totalSeconds) || 0);
        const h = Math.floor(safe / 3600);
        const m = Math.floor((safe % 3600) / 60);
        const s = safe % 60;
        if (h > 0) {
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const docName = doctor?.name || doctorName || "Doctor";
    const isEmergency = urgencyLevel === "emergency";
    const canCancel =
        status === "confirmed" || status === "pending_admin_approval";

    // Spec Section 15 Rule 9 fallback strategy if missing dynamically
    const tokenDisplay =
        tokenNumber ||
        `AYU-${new Date(date || Date.now()).toISOString().split("T")[0].replace(/-/g, "")}-DR${doctor?._id?.substring(0, 3) || "000"}-QUE`;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <PageHeader
                title="Appointment Details"
                subtitle={`Scheduled for ${formatDate(date)}`}
                backTo="/patient/appointments"
                action={
                    canCancel && (
                        <Button
                            variant="danger"
                            onClick={handleCancelClick}
                            loading={cancelling}
                        >
                            Cancel Appointment
                        </Button>
                    )
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Appointment Meta */}
                <div className="md:col-span-2 space-y-6">
                    <Card
                        className={isEmergency ? "border-red-200 border-2" : ""}
                    >
                        {isEmergency && (
                            <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-semibold text-sm uppercase tracking-wide">
                                    Emergency Booking
                                </span>
                            </div>
                        )}
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isEmergency ? "bg-red-100 text-red-600" : "bg-primary-50 text-primary-600"}`}
                                    >
                                        <Stethoscope className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-800">
                                            Dr. {docName}
                                        </h2>
                                        <p className="text-sm text-neutral-500 font-medium">
                                            {doctor?.specialization ||
                                                "Specialist"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <Badge type="status" value={status} />
                                    <div className="bg-neutral-100 px-3 py-1.5 rounded-md flex items-center gap-2 mt-1 border border-neutral-200 shadow-sm">
                                        <Hash className="w-4 h-4 text-neutral-500" />
                                        <span className="font-mono font-bold text-neutral-800 tracking-wider text-sm">
                                            {tokenDisplay}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isEmergency ? "bg-red-50/50" : "bg-neutral-50"}`}
                                >
                                    <Calendar
                                        className={`w-5 h-5 ${isEmergency ? "text-red-500" : "text-primary-600"}`}
                                    />
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-0.5">
                                            Date
                                        </p>
                                        <p className="font-semibold text-neutral-800">
                                            {formatDate(date)}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isEmergency ? "bg-red-50/50" : "bg-neutral-50"}`}
                                >
                                    <Clock
                                        className={`w-5 h-5 ${isEmergency ? "text-red-500" : "text-primary-600"}`}
                                    />
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-0.5">
                                            Time Slot
                                        </p>
                                        <p className="font-semibold text-neutral-800">
                                            {timeSlot}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isEmergency ? "bg-red-50/50" : "bg-neutral-50"}`}
                                >
                                    <User
                                        className={`w-5 h-5 ${isEmergency ? "text-red-500" : "text-primary-600"}`}
                                    />
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-0.5">
                                            People Ahead
                                        </p>
                                        <p className="font-semibold text-neutral-800">
                                            {queueAheadCount !== null &&
                                            queueAheadCount !== undefined
                                                ? queueAheadCount
                                                : "Not available"}
                                        </p>
                                    </div>
                                </div>
                                {(consultationStartedAt ||
                                    consultationEndedAt ||
                                    consultationDurationSeconds !== null) && (
                                    <div className="col-span-full mt-2 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">
                                                    Consultation Duration
                                                </p>
                                                <p className="font-bold text-lg text-blue-900">
                                                    {consultationDurationSeconds !==
                                                        null &&
                                                    consultationDurationSeconds !==
                                                        undefined
                                                        ? formatDuration(
                                                              consultationDurationSeconds,
                                                          )
                                                        : consultationStartedAt
                                                          ? "In progress"
                                                          : "Not recorded"}
                                                </p>
                                            </div>
                                        </div>
                                        {(consultationStartedAt ||
                                            consultationEndedAt) && (
                                            <div className="flex items-center gap-4 text-sm text-blue-800 bg-white/60 px-4 py-2 rounded-lg">
                                                {consultationStartedAt && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-blue-500 font-bold mb-0.5">
                                                            Started
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatTimeOnly(
                                                                consultationStartedAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {consultationStartedAt &&
                                                    consultationEndedAt && (
                                                        <div className="text-blue-300 font-bold">
                                                            →
                                                        </div>
                                                    )}
                                                {consultationEndedAt && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-blue-500 font-bold mb-0.5">
                                                            Ended
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatTimeOnly(
                                                                consultationEndedAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Pre-Screening Summary */}
                    {aiSummary ? (
                        <Card>
                            <CardHeader className="bg-neutral-50/70 py-4 border-b border-neutral-100">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary-600" />
                                    AI Pre-Screening Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {aiSummary.symptoms &&
                                    aiSummary.symptoms.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                                                Reported Symptoms
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {aiSummary.symptoms.map(
                                                    (symptom, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-md border border-neutral-200"
                                                        >
                                                            {symptom}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                {aiSummary.triageInsights && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-neutral-700 mb-1">
                                            Triage Insights
                                        </h4>
                                        <p className="text-sm text-neutral-600 bg-primary-50 px-4 py-3 rounded-lg border border-primary-100/50">
                                            {aiSummary.triageInsights}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : symptoms && symptoms.length > 0 ? (
                        <Card>
                            <CardContent className="p-5">
                                <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                                    Reported Symptoms
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {symptoms.map((symptom, idx) => (
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
                    ) : null}

                    {/* Prescription (only shown if completed) */}
                    {status === "completed" && prescription && (
                        <Card className="border-success-200 overflow-hidden">
                            <div className="bg-success-50 px-5 py-4 border-b border-success-100 flex items-center gap-2 text-success-800">
                                <Pill className="w-5 h-5" />
                                <h3 className="font-bold">
                                    Digital Prescription
                                </h3>
                            </div>
                            <CardContent className="p-5 space-y-5">
                                {prescription.medications &&
                                    prescription.medications.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide text-[11px]">
                                                Medications
                                            </h4>
                                            <div className="space-y-3">
                                                {prescription.medications.map(
                                                    (med, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-white border border-neutral-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                                        >
                                                            <div>
                                                                <p className="font-semibold text-neutral-800 text-sm">
                                                                    {med.name}
                                                                </p>
                                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                                    {med.dosage}{" "}
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
                                                            <span className="shrink-0 text-xs font-medium bg-neutral-100 px-2 py-1 rounded text-neutral-600 w-fit">
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
                                            Doctor's Notes
                                        </h4>
                                        <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                            {prescription.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Status / Progress */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="bg-neutral-50 py-4 border-b border-neutral-100">
                            <CardTitle className="text-sm">
                                Status Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div
                                        className={`absolute left-0 -translate-x-5.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${["pending_admin_approval", "confirmed", "completed", "cancelled"].includes(status) ? "bg-primary-600 text-white" : "bg-neutral-200"}`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="w-full">
                                        <p className="font-semibold text-sm text-neutral-800">
                                            Booked
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div
                                        className={`absolute left-0 -translate-x-5.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${["confirmed", "completed"].includes(status) ? "bg-primary-600 text-white" : status === "cancelled" || status === "rejected" ? "bg-red-500 text-white" : "bg-neutral-200 text-neutral-400"}`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="w-full">
                                        <p
                                            className={`font-semibold text-sm ${status === "cancelled" || status === "rejected" ? "text-red-600" : "text-neutral-800"}`}
                                        >
                                            {status === "cancelled" ||
                                            status === "rejected"
                                                ? "Cancelled"
                                                : "Confirmed"}
                                        </p>
                                    </div>
                                </div>

                                {status !== "cancelled" &&
                                    status !== "rejected" && (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                            <div
                                                className={`absolute left-0 -translate-x-5.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${status === "completed" ? "bg-success-500 text-white" : "bg-neutral-200 text-neutral-400"}`}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="w-full">
                                                <p
                                                    className={`font-semibold text-sm cursor-default ${status === "completed" ? "text-success-700" : "text-neutral-400"}`}
                                                >
                                                    Completed
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
