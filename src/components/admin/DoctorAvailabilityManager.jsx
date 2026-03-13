import { useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { TimeSlotPicker } from "../patient/TimeSlotPicker";
import { adminService } from "../../services/adminService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/toastMessageHelper";
import { Calendar, Clock, Plus, X } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_OPTIONS = [];
for (let h = 8; h <= 20; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    );
  }
}

const DoctorAvailabilityManager = ({ doctorId, initialData, onSaved }) => {
  const [availableDays, setAvailableDays] = useState(
    initialData?.availableDays || [],
  );
  const [timeSlots, setTimeSlots] = useState(initialData?.timeSlots || {});
  const [unavailableDates, setUnavailableDates] = useState(
    initialData?.unavailableDates || [],
  );
  const [newUnavailableDate, setNewUnavailableDate] = useState("");
  const [newUnavailableReason, setNewUnavailableReason] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setAvailableDays((prev) => {
      if (prev.includes(day)) {
        const updated = prev.filter((d) => d !== day);
        const newSlots = { ...timeSlots };
        delete newSlots[day];
        setTimeSlots(newSlots);
        return updated;
      }
      return [...prev, day];
    });
  };

  const toggleTimeSlot = (day, slot) => {
    setTimeSlots((prev) => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter((s) => s !== slot) };
      }
      return { ...prev, [day]: [...daySlots, slot].sort() };
    });
  };

  const addUnavailableDate = () => {
    if (!newUnavailableDate) return;
    setUnavailableDates((prev) => [
      ...prev,
      {
        date: newUnavailableDate,
        reason: newUnavailableReason || "Unavailable",
      },
    ]);
    setNewUnavailableDate("");
    setNewUnavailableReason("");
  };

  const removeUnavailableDate = (index) => {
    setUnavailableDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateDoctorAvailability(doctorId, {
        availableDays,
        timeSlots,
        unavailableDates,
      });
      showSuccessToast("Availability updated!");
      onSaved?.();
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to update availability",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={18} className="text-[#065A82]" />
          Doctor Availability
        </CardTitle>
      </CardHeader>

      {/* Available Days */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Available Days
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                availableDays.includes(day)
                  ? "bg-[#065A82] text-white border-[#065A82]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7293]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots per Day */}
      {availableDays.length > 0 && (
        <div className="mb-6 space-y-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Clock size={14} /> Time Slots
          </label>
          {availableDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <p className="text-sm font-medium text-gray-800 mb-2">{day}</p>
              <div className="flex flex-wrap gap-1.5">
                {TIME_OPTIONS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => toggleTimeSlot(day, slot)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                      (timeSlots[day] || []).includes(slot)
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-teal-400"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unavailable Dates */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Unavailable Dates
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={newUnavailableDate}
            onChange={(e) => setNewUnavailableDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            value={newUnavailableReason}
            onChange={(e) => setNewUnavailableReason(e.target.value)}
            placeholder="Reason (optional)"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={addUnavailableDate}
            disabled={!newUnavailableDate}
          >
            <Plus size={14} />
          </Button>
        </div>
        {unavailableDates.length > 0 && (
          <div className="space-y-1">
            {unavailableDates.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm bg-red-50 px-3 py-1.5 rounded"
              >
                <span className="text-red-700">{item.date}</span>
                <span className="text-gray-500">{item.reason}</span>
                <button
                  onClick={() => removeUnavailableDate(idx)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleSave} loading={saving}>
        Save Availability
      </Button>
    </Card>
  );
};

export { DoctorAvailabilityManager };
