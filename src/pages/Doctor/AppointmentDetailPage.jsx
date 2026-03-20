import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { AISummaryViewer } from "../../components/doctor/AISummaryViewer";
import { PatientDetails } from "../../components/doctor/PatientDetails";
import { doctorService } from "../../services/doctorService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MessageSquare,
    Pill,
    Plus,
    Trash2,
    Bot,
    User,
} from "lucide-react";

const AppointmentDetailPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    // Prescription form
    const [doctorNotes, setDoctorNotes] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [prescriptionNotes, setPrescriptionNotes] = useState("");
    const [medications, setMedications] = useState([]);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        loadData();
    }, [appointmentId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const result =
                await doctorService.getAppointmentDetails(appointmentId);
            setData(result.data);
        } catch {
            showErrorToast("Failed to load appointment");
        } finally {
            setLoading(false);
        }
    };

    const addMedication = () => {
        setMedications([
            ...medications,
            {
                name: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
            },
        ]);
    };

    const updateMedication = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const addTest = () => {
        setTests([...tests, { testName: "", instructions: "" }]);
    };

    const updateTest = (index, field, value) => {
        const updated = [...tests];
        updated[index][field] = value;
        setTests(updated);
    };

    const removeTest = (index) => {
        setTests(tests.filter((_, i) => i !== index));
    };

    const handleComplete = async () => {
        try {
            setCompleting(true);
            const payload = {
                doctorNotes,
                prescription: {
                    medications: medications.filter((m) => m.name),
                    tests: tests.filter((t) => t.testName),
                    diagnosis,
                    notes: prescriptionNotes,
                },
            };
            await doctorService.completeAppointment(appointmentId, payload);
            showSuccessToast("Appointment completed!");
            navigate("/doctor/appointments");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to complete appointment",
            );
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <LoadingSkeleton type="detail" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                <p className="text-gray-500">Appointment not found</p>
            </div>
        );
    }

    const appointment = data.appointment || data;
    const patient = data.patient || appointment.patient;
    const chatDetails = data.chatDetails;
    const summary = chatDetails?.summary || appointment.aiSummary;
    const isConfirmed = appointment.status === "confirmed";

    const formatDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : "";

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="flex items-center gap-2">
                    {appointment.urgencyLevel === "emergency" && (
                        <Badge variant="emergency">🚨 Emergency</Badge>
                    )}
                    <Badge variant={appointment.status} />
                </div>
            </div>

            {/* Appointment Info */}
            <Card>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={15} className="text-gray-400" />
                        {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-gray-400" />
                        {appointment.timeSlot}
                    </span>
                    {appointment.symptoms?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            {appointment.symptoms.map((s, i) => (
                                <span
                                    key={i}
                                    className="bg-gray-100 px-2 py-0.5 rounded text-xs"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Patient Info */}
            <PatientDetails patient={patient} />

            {/* AI Summary */}
            {summary && <AISummaryViewer summary={summary} />}

            {/* Chat History */}
            {chatDetails?.fullConversation?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare
                                size={18}
                                className="text-[#065A82]"
                            />
                            Chat History
                        </CardTitle>
                    </CardHeader>
                    <div className="max-h-80 overflow-y-auto space-y-3">
                        {chatDetails.fullConversation.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-[#1C7293]" : "bg-[#065A82]"}`}
                                    >
                                        {msg.role === "user" ? (
                                            <User
                                                size={12}
                                                className="text-white"
                                            />
                                        ) : (
                                            <Bot
                                                size={12}
                                                className="text-white"
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={`px-3 py-2 rounded-2xl text-sm ${msg.role === "user" ? "bg-[#1C7293] text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}
                                    >
                                        <p className="whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Complete Appointment Form */}
            {isConfirmed && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill size={18} className="text-[#065A82]" />
                            Complete Appointment
                        </CardTitle>
                    </CardHeader>

                    <div className="space-y-4">
                        {/* Doctor Notes */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Doctor Notes
                            </label>
                            <textarea
                                value={doctorNotes}
                                onChange={(e) => setDoctorNotes(e.target.value)}
                                placeholder="Add consultation notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                                rows={3}
                            />
                        </div>

                        {/* Diagnosis */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Diagnosis
                            </label>
                            <input
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Enter diagnosis..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                            />
                        </div>

                        {/* Medications */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Medications
                                </label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={addMedication}
                                >
                                    <Plus size={14} /> Add Medication
                                </Button>
                            </div>
                            {medications.map((med, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 p-3 bg-gray-50 rounded-lg relative"
                                >
                                    <input
                                        value={med.name}
                                        onChange={(e) =>
                                            updateMedication(
                                                i,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Name"
                                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        value={med.dosage}
                                        onChange={(e) =>
                                            updateMedication(
                                                i,
                                                "dosage",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Dosage"
                                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        value={med.frequency}
                                        onChange={(e) =>
                                            updateMedication(
                                                i,
                                                "frequency",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Frequency"
                                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        value={med.duration}
                                        onChange={(e) =>
                                            updateMedication(
                                                i,
                                                "duration",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Duration"
                                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                    <div className="flex items-center gap-1">
                                        <input
                                            value={med.instructions}
                                            onChange={(e) =>
                                                updateMedication(
                                                    i,
                                                    "instructions",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Instructions"
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                        />
                                        <button
                                            onClick={() => removeMedication(i)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tests */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Tests
                                </label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={addTest}
                                >
                                    <Plus size={14} /> Add Test
                                </Button>
                            </div>
                            {tests.map((test, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input
                                        value={test.testName}
                                        onChange={(e) =>
                                            updateTest(
                                                i,
                                                "testName",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Test name"
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        value={test.instructions}
                                        onChange={(e) =>
                                            updateTest(
                                                i,
                                                "instructions",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Instructions"
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    />
                                    <button
                                        onClick={() => removeTest(i)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Prescription Notes */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Prescription Notes
                            </label>
                            <textarea
                                value={prescriptionNotes}
                                onChange={(e) =>
                                    setPrescriptionNotes(e.target.value)
                                }
                                placeholder="Additional notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                                rows={2}
                            />
                        </div>

                        <Button
                            onClick={handleComplete}
                            loading={completing}
                            size="lg"
                            className="w-full"
                        >
                            Mark as Completed
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export { AppointmentDetailPage };
