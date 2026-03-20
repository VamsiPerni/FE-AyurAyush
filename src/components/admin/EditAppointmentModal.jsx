import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TimeSlotPicker } from "../patient/TimeSlotPicker";
import { patientService } from "../../services/patientService";
import { showErrorToast } from "../../utils/toastMessageHelper";

const EditAppointmentModal = ({ isOpen, onClose, appointment, onSave }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [adminNotes, setAdminNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const details = appointment?.appointmentDetails || appointment || {};

    useEffect(() => {
        if (isOpen) {
            setSelectedDoctorId(
                appointment?.doctor?._id || appointment?.doctor?.doctorId || "",
            );
            setSelectedDate(
                details.date
                    ? new Date(details.date).toISOString().split("T")[0]
                    : "",
            );
            setSelectedSlot(details.timeSlot || "");
            setAdminNotes("");
            loadDoctors();
        }
    }, [isOpen]);

    const loadDoctors = async () => {
        try {
            const result = await patientService.getDoctors("");
            setDoctors(result.data?.doctors || []);
        } catch {
            showErrorToast("Failed to load doctors");
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

    useEffect(() => {
        if (selectedDoctorId && selectedDate) {
            loadSlots(selectedDoctorId, selectedDate);
            setSelectedSlot("");
        }
    }, [selectedDoctorId, selectedDate]);

    const handleSave = async () => {
        setLoading(true);

        const edits = {};
        const originalDoctorId =
            appointment?.doctor?._id || appointment?.doctor?.doctorId;
        if (selectedDoctorId && selectedDoctorId !== originalDoctorId)
            edits.doctorId = selectedDoctorId;
        const originalDate = details.date
            ? new Date(details.date).toISOString().split("T")[0]
            : "";
        if (selectedDate && selectedDate !== originalDate)
            edits.date = selectedDate;
        if (selectedSlot && selectedSlot !== details.timeSlot)
            edits.timeSlot = selectedSlot;

        const payload = {};
        if (Object.keys(edits).length > 0) payload.edits = edits;
        if (adminNotes.trim()) payload.adminNotes = adminNotes;

        await onSave(payload);
        setLoading(false);
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
            title="Edit & Approve Appointment"
            size="lg"
        >
            <div className="space-y-4">
                {/* Doctor Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Doctor
                    </label>
                    <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                    >
                        <option value="">Select a doctor</option>
                        {doctors.map((doc) => (
                            <option
                                key={doc.doctorId || doc._id}
                                value={doc.doctorId || doc._id}
                            >
                                Dr. {doc.name} — {doc.specialization}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date
                    </label>
                    <input
                        type="date"
                        min={getMinDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                    />
                </div>

                {/* Time Slot */}
                {selectedDate && selectedDoctorId && (
                    <TimeSlotPicker
                        slots={availableSlots}
                        selected={selectedSlot}
                        onSelect={setSelectedSlot}
                        loading={slotsLoading}
                    />
                )}

                {/* Admin Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Admin Notes (optional)
                    </label>
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                        rows={3}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} loading={loading}>
                        Approve with Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export { EditAppointmentModal };
