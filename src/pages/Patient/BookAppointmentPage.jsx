import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import {
    Calendar,
    Search,
    Clock,
    ShieldAlert,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    FileText,
    Trash2,
    AlertTriangle,
    CreditCard,
} from "lucide-react";
import { patientService } from "../../services/patientService";
import { paymentService } from "../../services/paymentService";
import { chatService } from "../../services/chatService";
import { useAuthContext } from "../../contexts/AppContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { DoctorCard } from "../../components/patient/DoctorCard";
import { DateSlotStrip } from "../../components/patient/DateSlotStrip";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatsSkeleton, CardSkeleton } from "../../components/ui/Skeleton";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Safe extraction of conversation ID per Spec §12
    const authContext = useAuthContext() || {};
    const queryConversationId = new URLSearchParams(location.search).get(
        "conversationId",
    );
    const incomingConversationId =
        queryConversationId ||
        location.state?.conversationId ||
        authContext.conversationId ||
        localStorage.getItem("conversationId");

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(
        incomingConversationId || "",
    );
    const [summaryConfirmed, setSummaryConfirmed] = useState(false);
    const [deletingSummary, setDeletingSummary] = useState(false);
    const [deletingConversation, setDeletingConversation] = useState(false);
    const [showDeleteSummaryModal, setShowDeleteSummaryModal] = useState(false);
    const [showDeleteConversationModal, setShowDeleteConversationModal] =
        useState(false);
    const [showDoctorMismatchModal, setShowDoctorMismatchModal] =
        useState(false);
    const [pendingDoctorSelection, setPendingDoctorSelection] = useState(null);
    const [mismatchInsight, setMismatchInsight] = useState(null);

    // Selections
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);

    const selectedConversation = useMemo(
        () =>
            conversations.find(
                (c) => (c.conversationId || c._id) === selectedConversationId,
            ) || null,
        [conversations, selectedConversationId],
    );

    const aiUrgencyLevel =
        selectedConversation?.summary?.urgencyLevel === "emergency"
            ? "emergency"
            : "normal";

    useEffect(() => {
        loadDoctors();
        loadConversations();
    }, []);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const result = await patientService.getDoctors();
            setDoctors(result.data?.doctors || result.data || []);
        } catch (err) {
            showErrorToast("Failed to load doctors available for booking.");
        } finally {
            setLoading(false);
        }
    };

    const loadConversations = async () => {
        try {
            const result = await chatService.getConversations();
            const list =
                result.data?.conversations || result.conversations || [];
            const completedUnbooked = list.filter(
                (c) => c.status === "completed" && !c.appointmentId,
            );
            setConversations(completedUnbooked);

            if (incomingConversationId && !selectedConversationId) {
                setSelectedConversationId(incomingConversationId);
            }
        } catch {
            setConversations([]);
        }
    };

    const handleDeleteSummary = async () => {
        if (!selectedConversationId) return;
        try {
            setDeletingSummary(true);
            await chatService.deleteConversationSummary(selectedConversationId);
            showSuccessToast("Summary deleted for selected consultation.");
            setSummaryConfirmed(false);
            await loadConversations();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to delete summary.",
            );
        } finally {
            setDeletingSummary(false);
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedConversationId) return;
        try {
            setDeletingConversation(true);
            await chatService.deleteConversation(selectedConversationId);
            showSuccessToast("Consultation deleted successfully.");
            setSelectedConversationId("");
            setSummaryConfirmed(false);
            setStep(1);
            await loadConversations();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to delete consultation.",
            );
        } finally {
            setDeletingConversation(false);
        }
    };

    const loadSlots = async (doctorId, date) => {
        if (!doctorId || !date) return;
        try {
            setLoadingSlots(true);
            setSelectedSlot("");
            const result = await patientService.getAvailableSlots(
                doctorId,
                date,
            );
            const payload = result?.data || result || {};
            const normalizedSlots = Array.isArray(payload?.availableSlots)
                ? payload.availableSlots
                : Array.isArray(payload?.slots)
                  ? payload.slots
                  : Array.isArray(payload)
                    ? payload
                    : [];
            setAvailableSlots(normalizedSlots);
        } catch (err) {
            showErrorToast("Failed to load available slots for this date.");
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (selectedDoctor && date) {
            loadSlots(selectedDoctor._id || selectedDoctor.doctorId, date);
        }
    };

    const handleDoctorSelect = (doctor) => {
        if (!selectedConversationId) {
            showErrorToast(
                "Please select a completed consultation before choosing a doctor.",
            );
            return;
        }

        if (!summaryConfirmed) {
            showErrorToast(
                "Please review and confirm the consultation summary first.",
            );
            return;
        }

        const matchEvaluation = evaluateDoctorMatch(doctor);
        if (!matchEvaluation.isMatch) {
            setPendingDoctorSelection(doctor);
            setMismatchInsight(matchEvaluation);
            setShowDoctorMismatchModal(true);
            return;
        }

        setSelectedDoctor(doctor);
        setStep(2);
    };

    const proceedWithPendingDoctor = () => {
        if (!pendingDoctorSelection) {
            setShowDoctorMismatchModal(false);
            return;
        }
        setSelectedDoctor(pendingDoctorSelection);
        setStep(2);
        setShowDoctorMismatchModal(false);
        setPendingDoctorSelection(null);
        setMismatchInsight(null);
    };

    const evaluateDoctorMatch = (doctor) => {
        const summary = selectedConversation?.summary || {};
        const symptomsText = [
            ...(summary.symptoms || []),
            summary.detailedSummary || "",
        ]
            .join(" ")
            .toLowerCase();

        if (!symptomsText.trim()) {
            return { isMatch: true, reason: "No symptom data available." };
        }

        const doctorText = [
            doctor.specialization,
            doctor.qualification,
            getMostlyTreatsLabel(doctor),
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const keywordRules = [
            {
                symptom: ["skin", "rash", "acne", "eczema", "hair"],
                doctor: ["derma", "dermat", "skin"],
                label: "skin/hair concerns",
            },
            {
                symptom: ["knee", "joint", "bone", "back", "spine"],
                doctor: ["ortho", "orthopedic", "bone", "joint"],
                label: "bone/joint concerns",
            },
            {
                symptom: [
                    "acidity",
                    "stomach",
                    "digestion",
                    "gastric",
                    "constipation",
                ],
                doctor: ["general", "ayur", "gastro"],
                label: "digestive concerns",
            },
            {
                symptom: ["stress", "anxiety", "sleep", "fatigue"],
                doctor: ["general", "ayur", "mental", "psy"],
                label: "stress/fatigue concerns",
            },
            {
                symptom: ["fever", "cold", "cough", "infection"],
                doctor: ["general", "family", "physician"],
                label: "general illness",
            },
        ];

        const relevantCategories = keywordRules.filter((rule) =>
            rule.symptom.some((keyword) => symptomsText.includes(keyword)),
        );

        if (relevantCategories.length === 0) {
            return { isMatch: true, reason: "No mapped symptom keywords found." };
        }

        const matchedCategories = relevantCategories.filter((rule) =>
            rule.doctor.some((keyword) => doctorText.includes(keyword)),
        );

        if (matchedCategories.length > 0) {
            return {
                isMatch: true,
                reason: `Doctor appears suitable for ${matchedCategories
                    .map((item) => item.label)
                    .join(", ")}.`,
            };
        }

        return {
            isMatch: false,
            reason:
                "Doctor specialization may not closely match the selected consultation symptoms.",
        };
    };

    const handleStepNavigation = (targetStep) => {
        if (targetStep === step) return;

        // Always allow moving backwards.
        if (targetStep < step) {
            setStep(targetStep);
            return;
        }

        if (targetStep === 2) {
            if (!selectedDoctor) {
                showErrorToast("Please select a doctor first.");
                return;
            }
            setStep(2);
            return;
        }

        if (targetStep === 3) {
            if (!selectedDoctor) {
                showErrorToast("Please select a doctor first.");
                return;
            }
            if (!selectedDate || !selectedSlot) {
                showErrorToast(
                    "Please select both date and time slot before confirming.",
                );
                return;
            }
            setStep(3);
        }
    };

    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot) {
            showErrorToast("Please complete all selections first.");
            return;
        }
        try {
            setBookingLoading(true);

            const loaded = await loadRazorpayScript();
            if (!loaded) {
                showErrorToast("Payment gateway failed to load. Check your internet connection.");
                return;
            }

            // Book appointment — returns appointmentId + paymentOrder
            const result = await patientService.bookAppointment({
                doctorId: selectedDoctor._id || selectedDoctor.doctorId,
                date: selectedDate,
                timeSlot: selectedSlot,
                conversationId: selectedConversationId,
            });

            const booking = result.data || result;
            const order = booking.paymentOrder;

            if (!order?.orderId) {
                showErrorToast("Booking created but payment order missing. Please pay from My Appointments.");
                navigate("/patient/appointments");
                return;
            }

            // Open Razorpay checkout immediately
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "AyurAyush",
                description: "Consultation Fee",
                order_id: order.orderId,
                prefill: order.prefill,
                theme: { color: "#16a34a" },
                handler: async (response) => {
                    try {
                        await paymentService.verifyPayment({
                            appointmentId: booking.appointmentId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        localStorage.removeItem("conversationId");
                        showSuccessToast("Payment successful! Appointment submitted for admin review.");
                        navigate("/patient/appointments");
                    } catch {
                        showErrorToast("Payment verification failed. Your booking is saved — pay from My Appointments.");
                        navigate("/patient/appointments");
                    }
                },
                modal: {
                    ondismiss: () => {
                        showErrorToast("Payment cancelled. Complete payment from My Appointments to confirm booking.");
                        setBookingLoading(false);
                        navigate("/patient/appointments");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => {
                showErrorToast("Payment failed. You can retry from My Appointments.");
                setBookingLoading(false);
                navigate("/patient/appointments");
            });
            rzp.open();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    "Failed to book appointment. Please try again.",
            );
        } finally {
            setBookingLoading(false);
        }
    };

    // Filter Doctors
    const filteredDoctors = doctors.filter(
        (doc) =>
            doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialization
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const getDoctorCategory = (doctor) => {
        const specialization = (doctor.specialization || "").toLowerCase();
        const qualification = (doctor.qualification || "").toLowerCase();

        if (
            specialization.includes("ayur") ||
            specialization.includes("panchakarma") ||
            qualification.includes("bams")
        ) {
            return "Ayurveda Care";
        }

        if (
            specialization.includes("general") ||
            specialization.includes("family") ||
            specialization.includes("primary")
        ) {
            return "General Care";
        }

        return "Specialist Care";
    };

    const getMostlyTreatsLabel = (doctor) => {
        const specialization = (doctor.specialization || "").toLowerCase();

        if (
            specialization.includes("derma") ||
            specialization.includes("skin")
        ) {
            return "Mostly treats skin and hair concerns";
        }
        if (
            specialization.includes("ortho") ||
            specialization.includes("bone") ||
            specialization.includes("joint")
        ) {
            return "Mostly treats bone, joint, and mobility issues";
        }
        if (specialization.includes("panchakarma")) {
            return "Mostly treats detox and therapy-based recovery cases";
        }
        if (
            specialization.includes("ayur") ||
            specialization.includes("bams")
        ) {
            return "Mostly treats lifestyle and chronic wellness concerns";
        }
        if (
            specialization.includes("general") ||
            specialization.includes("family") ||
            specialization.includes("primary")
        ) {
            return "Mostly treats fever, cold, fatigue, and general health issues";
        }

        return "Mostly treats cases related to this specialization";
    };

    const categorizedDoctors = useMemo(() => {
        const grouped = {
            "General Care": [],
            "Ayurveda Care": [],
            "Specialist Care": [],
        };

        filteredDoctors.forEach((doctor) => {
            const category = getDoctorCategory(doctor);
            grouped[category].push(doctor);
        });

        return grouped;
    }, [filteredDoctors]);

    // Date boundaries
    const today = new Date().toISOString().split("T")[0];
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 7);
    const maxDate = maxDateObj.toISOString().split("T")[0];

    const canNavigateToStep = (targetStep) => {
        if (targetStep === 1) return true;
        if (targetStep === 2) return Boolean(selectedDoctor);
        if (targetStep === 3)
            return Boolean(selectedDoctor && selectedDate && selectedSlot);
        return false;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <PageHeader
                title="Book Appointment"
                subtitle="Complete your booking based on AI consultation"
                backTo={step > 1 ? undefined : "/patient/dashboard"}
                action={
                    step > 1 && (
                        <Button
                            variant="ghost"
                            icon={ArrowLeft}
                            onClick={() => setStep(Math.max(1, step - 1))}
                        >
                            Back
                        </Button>
                    )
                }
            />

            <div className="rounded-xl border border-teal-200 dark:border-teal-700/40 bg-teal-50/60 dark:bg-teal-900/10 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-300 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Select Completed Consultation
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/patient/chatbot")}
                    >
                        Start AI Consultation
                    </Button>
                </div>

                {conversations.length === 0 ? (
                    <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2">
                        No completed consultations found. Please finish AI chat
                        first, then return to book.
                    </p>
                ) : (
                    <>
                        <select
                            value={selectedConversationId}
                            onChange={(e) => {
                                setSelectedConversationId(e.target.value);
                                setSummaryConfirmed(false);
                                setStep(1);
                            }}
                            className="w-full px-3 py-2 border border-teal-300 dark:border-teal-700/50 rounded-xl text-sm bg-white dark:bg-dark-elevated text-neutral-800 dark:text-neutral-100"
                        >
                            <option value="">Select consultation...</option>
                            {conversations.map((c) => {
                                const id = c.conversationId || c._id;
                                const symptomText =
                                    c.summary?.symptoms?.join(", ") ||
                                    "Consultation";
                                return (
                                    <option key={id} value={id}>
                                        {symptomText} -{" "}
                                        {new Date(
                                            c.createdAt,
                                        ).toLocaleDateString()}
                                        {c.summary?.recommendedSpecialist
                                            ? ` (Recommended: ${c.summary.recommendedSpecialist})`
                                            : ""}
                                    </option>
                                );
                            })}
                        </select>

                        {selectedConversation?.summary && (
                            <div className="bg-white dark:bg-dark-elevated border border-teal-200 dark:border-teal-700/40 rounded-xl p-3 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                                <p>
                                    <span className="font-semibold">
                                        Symptoms:
                                    </span>{" "}
                                    {selectedConversation.summary.symptoms?.join(
                                        ", ",
                                    ) || "Not specified"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Duration:
                                    </span>{" "}
                                    {selectedConversation.summary.duration ||
                                        "Not specified"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Urgency:
                                    </span>{" "}
                                    {selectedConversation.summary
                                        .urgencyLevel || "normal"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Summary:
                                    </span>{" "}
                                    {selectedConversation.summary
                                        .detailedSummary ||
                                        "Please review chat history."}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-xs text-teal-800 dark:text-teal-400">
                                Confirm this consultation summary before
                                choosing a doctor.
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    icon={Trash2}
                                    disabled={!selectedConversationId || deletingSummary}
                                    loading={deletingSummary}
                                    onClick={() => setShowDeleteSummaryModal(true)}
                                >
                                    Delete Summary
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    icon={Trash2}
                                    disabled={!selectedConversationId || deletingConversation}
                                    loading={deletingConversation}
                                    onClick={() =>
                                        setShowDeleteConversationModal(true)
                                    }
                                >
                                    Delete Consultation
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={!selectedConversationId}
                                    onClick={() => {
                                        setSummaryConfirmed(true);
                                        showSuccessToast(
                                            "Summary confirmed. You can now select a doctor.",
                                        );
                                    }}
                                >
                                    {summaryConfirmed
                                        ? "Summary Confirmed"
                                        : "Confirm Summary"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8 px-2 sm:px-8">
                {[
                    { num: 1, label: "Select Doctor" },
                    { num: 2, label: "Date & Time" },
                    { num: 3, label: "Confirm" },
                ].map((s, idx) => {
                    const isStepEnabled = canNavigateToStep(s.num);
                    return (
                    <button
                        type="button"
                        key={s.num}
                        onClick={() => handleStepNavigation(s.num)}
                        disabled={!isStepEnabled}
                        aria-disabled={!isStepEnabled}
                        className={`flex flex-col items-center gap-2 relative z-10 ${
                            isStepEnabled
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-55"
                        }`}
                    >
                        <div
                            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors
              ${step >= s.num ? "bg-primary-600 text-white shadow-md shadow-primary-500/30" : "bg-neutral-100 dark:bg-dark-elevated text-neutral-400"}
            `}
                        >
                            {step > s.num ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                s.num
                            )}
                        </div>
                        <span
                            className={`text-xs font-semibold ${step >= s.num ? "text-primary-700 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}`}
                        >
                            {s.label}
                        </span>
                    </button>
                );
                })}
                {/* Step connector lines */}
                <div className="absolute left-0 right-0 top-5 -z-10 hidden sm:block px-14">
                    <div className="h-1 bg-neutral-100 dark:bg-dark-elevated rounded-full w-full">
                        <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-300"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <CardSkeleton />
            ) : (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-neutral-100 dark:border-dark-border p-6 min-h-[400px]">
                    {/* STEP 1: Select Doctor */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search doctors by name or specialization..."
                                        icon={Search}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {filteredDoctors.length === 0 ? (
                                <EmptyState
                                    icon={Search}
                                    title="No doctors found"
                                    description="Try adjusting your search terms."
                                />
                            ) : (
                                <div className="space-y-6">
                                    {[
                                        {
                                            key: "General Care",
                                            hint: "For common day-to-day health concerns.",
                                        },
                                        {
                                            key: "Ayurveda Care",
                                            hint: "For Ayurveda-focused and holistic care.",
                                        },
                                        {
                                            key: "Specialist Care",
                                            hint: "For specific condition-focused treatment.",
                                        },
                                    ].map(({ key, hint }) => {
                                        const doctorsInCategory =
                                            categorizedDoctors[key];

                                        if (!doctorsInCategory?.length)
                                            return null;

                                        return (
                                            <div
                                                key={key}
                                                className="space-y-3 rounded-xl border border-neutral-100 dark:border-dark-border p-4"
                                            >
                                                <div>
                                                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                                        {key}
                                                    </h4>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                        {hint}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {doctorsInCategory.map(
                                                        (doc) => (
                                                            <DoctorCard
                                                                key={
                                                                    doc.doctorId ||
                                                                    doc._id
                                                                }
                                                                doctor={doc}
                                                                onSelect={
                                                                    handleDoctorSelect
                                                                }
                                                                mostlyTreats={getMostlyTreatsLabel(
                                                                    doc,
                                                                )}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!summaryConfirmed && conversations.length > 0 && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2">
                                    Select and confirm a completed consultation
                                    summary above to continue booking.
                                </p>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Date & Time */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                            <DateSlotStrip
                                doctorId={selectedDoctor?._id || selectedDoctor?.doctorId}
                                selectedDate={selectedDate}
                                selectedSlot={selectedSlot}
                                onDateSelect={(date) => {
                                    setSelectedDate(date);
                                    setAvailableSlots([]);
                                }}
                                onSlotSelect={setSelectedSlot}
                            />

                            <div className="pt-6 border-t border-neutral-100 dark:border-dark-border flex justify-between">
                                <Button
                                    variant="outline"
                                    icon={ArrowLeft}
                                    onClick={() => setStep(1)}
                                >
                                    Back to Doctors
                                </Button>
                                <Button
                                    icon={ArrowRight}
                                    onClick={() => setStep(3)}
                                    disabled={!selectedDate || !selectedSlot}
                                >
                                    Continue to Confirmation
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm Booking */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                                    Review Appointment
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    Please confirm the details below before
                                    booking.
                                </p>
                            </div>

                            <Card className="bg-neutral-50 dark:bg-dark-elevated border-neutral-200 dark:border-dark-border shadow-none">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-dark-border">
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Doctor
                                        </span>
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight">
                                            Dr. {selectedDoctor?.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-dark-border">
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Specialization
                                        </span>
                                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                            {selectedDoctor?.specialization}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-dark-border">
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Date
                                        </span>
                                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                            {new Date(
                                                selectedDate,
                                            ).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Time Slot
                                        </span>
                                        <span className="font-medium text-primary-700">
                                            {selectedSlot}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="rounded-lg border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-elevated px-4 py-3">
                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Urgency (AI detected)
                                </p>
                                <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">
                                    {aiUrgencyLevel === "emergency"
                                        ? "Emergency"
                                        : "Normal"}
                                </p>
                                <p className="text-xs mt-1 text-neutral-500">
                                    This is automatically detected from your
                                    consultation summary and cannot be edited by
                                    patient.
                                </p>
                            </div>

                            {aiUrgencyLevel === "emergency" && (
                                <div className="flex gap-3 items-start p-4 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700/40 animate-in fade-in slide-in-from-top-2">
                                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">
                                        Emergency appointments are subject to
                                        immediate hospital protocol. An extra
                                        triage fee may apply upon arrival.
                                    </p>
                                </div>
                            )}

                            <div className="pt-6 flex gap-3">
                                <Button
                                    variant="outline"
                                    icon={ArrowLeft}
                                    onClick={() => setStep(2)}
                                >
                                    Back to Date & Time
                                </Button>
                                <Button
                                    type="submit"
                                    fullWidth
                                    onClick={handleBookAppointment}
                                    loading={bookingLoading}
                                    variant={
                                        aiUrgencyLevel === "emergency"
                                            ? "danger"
                                            : "primary"
                                    }
                                    icon={CreditCard}
                                >
                                    {aiUrgencyLevel === "emergency"
                                        ? "Book & Pay Now (Emergency)"
                                        : "Book & Pay Now"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={showDeleteSummaryModal}
                onClose={() =>
                    !deletingSummary && setShowDeleteSummaryModal(false)
                }
                title="Delete Consultation Summary"
                description="This removes only the generated summary and keeps the consultation chat."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteSummaryModal(false)}
                            disabled={deletingSummary}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            loading={deletingSummary}
                            onClick={async () => {
                                await handleDeleteSummary();
                                setShowDeleteSummaryModal(false);
                            }}
                        >
                            Delete Summary
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-neutral-700">
                    You can generate a new summary later by completing a new
                    consultation.
                </p>
            </Modal>

            <Modal
                isOpen={showDeleteConversationModal}
                onClose={() =>
                    !deletingConversation &&
                    setShowDeleteConversationModal(false)
                }
                title="Delete Consultation"
                description="This permanently removes the selected consultation and its messages."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setShowDeleteConversationModal(false)
                            }
                            disabled={deletingConversation}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            loading={deletingConversation}
                            onClick={async () => {
                                await handleDeleteConversation();
                                setShowDeleteConversationModal(false);
                            }}
                        >
                            Delete Consultation
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-neutral-700">
                    If this consultation is linked to an appointment, deletion
                    will be blocked.
                </p>
            </Modal>

            <Modal
                isOpen={showDoctorMismatchModal}
                onClose={() => {
                    setShowDoctorMismatchModal(false);
                    setPendingDoctorSelection(null);
                    setMismatchInsight(null);
                }}
                title="Doctor-Symptom Match Warning"
                description="This doctor may not be the closest match for your consultation summary."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDoctorMismatchModal(false);
                                setPendingDoctorSelection(null);
                                setMismatchInsight(null);
                            }}
                        >
                            Select Another Doctor
                        </Button>
                        <Button variant="primary" onClick={proceedWithPendingDoctor}>
                            Proceed Anyway
                        </Button>
                    </>
                }
            >
                <div className="space-y-3 text-sm text-neutral-700">
                    <p className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <span>{mismatchInsight?.reason}</span>
                    </p>
                    <p className="text-xs text-neutral-500">
                        You can continue with this doctor if you still prefer,
                        or choose another doctor category for a closer match.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export { BookAppointmentPage };
export default BookAppointmentPage;
