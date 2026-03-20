import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { DoctorCard } from "./DoctorCard";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { patientService } from "../../services/patientService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BookingModal = ({
    isOpen,
    onClose,
    conversationId,
    summary,
    onBooked,
}) => {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (isOpen && step === 1) {
            loadDoctors();
        }
    }, [isOpen]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const specialization = summary?.recommendedSpecialist || "";
            const result = await patientService.getDoctors(specialization);
            setDoctors(result.data?.doctors || []);
        } catch (err) {
            showErrorToast("Failed to load doctors");
            console.err(err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllDoctors = async () => {
        try {
            setLoading(true);
            const result = await patientService.getDoctors("");
            setDoctors(result.data?.doctors || []);
        } catch {
            showErrorToast("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const loadSlots = async (doctorId, date) => {
        try {
            setSlotsLoading(true);
            const result = await patientService.getAvailableSlots(
                doctorId,
                date,
            );
            setAvailableSlots(result.data?.availableSlots || []);
        } catch {
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedSlot("");
        if (selectedDoctor && date) {
            const doctorId = selectedDoctor.doctorId || selectedDoctor._id;
            loadSlots(doctorId, date);
        }
    };

    const handleBook = async () => {
        try {
            setBooking(true);
            const doctorId = selectedDoctor.doctorId || selectedDoctor._id;
            const result = await patientService.bookAppointment({
                conversationId,
                doctorId,
                date: selectedDate,
                timeSlot: selectedSlot,
            });
            onBooked?.(result);
            onClose();
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Booking failed");
        } finally {
            setBooking(false);
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Book Appointment"
            size="lg"
        >
            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                step >= s
                                    ? "bg-[#065A82] text-white"
                                    : "bg-gray-200 text-gray-500"
                            }`}
                        >
                            {s}
                        </div>
                        <span
                            className={`text-sm hidden sm:block ${step >= s ? "text-[#065A82] font-medium" : "text-gray-400"}`}
                        >
                            {s === 1
                                ? "Select Doctor"
                                : s === 2
                                  ? "Choose Date & Time"
                                  : "Confirm"}
                        </span>
                        {s < 3 && (
                            <div
                                className={`flex-1 h-0.5 ${step > s ? "bg-[#065A82]" : "bg-gray-200"}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Doctor */}
            {step === 1 && (
                <div>
                    {summary?.recommendedSpecialist && (
                        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                            AI recommends:{" "}
                            <span className="font-semibold">
                                {summary.recommendedSpecialist}
                            </span>
                            <button
                                onClick={loadAllDoctors}
                                className="ml-2 underline text-teal-600 text-xs"
                            >
                                Show all doctors
                            </button>
                        </div>
                    )}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-40 bg-gray-100 rounded-lg animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                            {doctors.map((doc) => (
                                <DoctorCard
                                    key={doc.doctorId || doc._id}
                                    doctor={doc}
                                    onSelect={setSelectedDoctor}
                                    selected={
                                        (selectedDoctor?.doctorId ||
                                            selectedDoctor?._id) ===
                                        (doc.doctorId || doc._id)
                                    }
                                />
                            ))}
                            {doctors.length === 0 && (
                                <p className="col-span-2 text-center text-gray-500 py-8">
                                    No doctors available
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!selectedDoctor}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Select Date
                        </label>
                        <input
                            type="date"
                            min={getMinDate()}
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                        />
                    </div>

                    {selectedDate && (
                        <TimeSlotPicker
                            slots={availableSlots}
                            selected={selectedSlot}
                            onSelect={setSelectedSlot}
                            loading={slotsLoading}
                        />
                    )}

                    <div className="flex justify-between mt-4">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            <ChevronLeft size={16} /> Back
                        </Button>
                        <Button
                            onClick={() => setStep(3)}
                            disabled={!selectedSlot}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
                <div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
                        <h4 className="font-semibold text-gray-900">
                            Booking Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Doctor</span>
                                <p className="font-medium">
                                    {selectedDoctor?.name}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Specialization
                                </span>
                                <p className="font-medium">
                                    {selectedDoctor?.specialization}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date</span>
                                <p className="font-medium">
                                    {new Date(selectedDate).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        },
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Time</span>
                                <p className="font-medium">{selectedSlot}</p>
                            </div>
                        </div>
                        {summary && (
                            <div className="pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                    Symptoms
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {summary.symptoms?.map((s, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-white border px-2 py-0.5 rounded-full"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                            <ChevronLeft size={16} /> Back
                        </Button>
                        <Button onClick={handleBook} loading={booking}>
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export { BookingModal };
