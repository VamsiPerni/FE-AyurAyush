import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { patientService } from "../../services/patientService";

// Returns array of 7 date strings ["YYYY-MM-DD", ...] starting from today
const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
};

const formatDayName = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });

const formatDayNum = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const DateSlotStrip = ({ doctorId, selectedDate, selectedSlot, onDateSelect, onSlotSelect }) => {
    const [slotMap, setSlotMap] = useState({}); // { "YYYY-MM-DD": ["09:00 - 10:00", ...] }
    const [loading, setLoading] = useState(false);

    const dates = getNext7Days();

    const loadAllSlots = useCallback(async () => {
        if (!doctorId) return;
        setLoading(true);
        try {
            const results = await Promise.all(
                dates.map((date) =>
                    patientService.getAvailableSlots(doctorId, date)
                        .then((res) => ({ date, slots: res?.data?.availableSlots || [] }))
                        .catch(() => ({ date, slots: [] }))
                )
            );
            const map = {};
            results.forEach(({ date, slots }) => { map[date] = slots; });
            setSlotMap(map);
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        loadAllSlots();
    }, [loadAllSlots]);

    const handleDateClick = (date) => {
        onDateSelect(date);
        onSlotSelect(""); // reset slot when date changes
    };

    const slotsForSelected = selectedDate ? (slotMap[selectedDate] || []) : [];

    return (
        <div className="space-y-5">
            {/* 7-day strip */}
            <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">Select Date</p>
                <div className="grid grid-cols-7 gap-2">
                    {dates.map((date) => {
                        const count = slotMap[date]?.length ?? null;
                        const isSelected = selectedDate === date;
                        const hasSlots = count > 0;
                        const isToday = date === dates[0];

                        return (
                            <button
                                key={date}
                                type="button"
                                onClick={() => handleDateClick(date)}
                                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all duration-200 ${
                                    isSelected
                                        ? "bg-primary-600 border-primary-600 text-white shadow-md"
                                        : hasSlots
                                          ? "bg-white border-neutral-200 text-neutral-700 hover:border-primary-400 hover:bg-primary-50"
                                          : "bg-neutral-50 border-neutral-100 text-neutral-400 cursor-pointer"
                                }`}
                            >
                                <span className={`text-xs font-semibold uppercase tracking-wide ${
                                    isSelected ? "text-primary-100" : isToday ? "text-primary-600" : "text-neutral-500"
                                }`}>
                                    {isToday ? "Today" : formatDayName(date)}
                                </span>
                                <span className={`text-base font-bold leading-none ${
                                    isSelected ? "text-white" : "text-neutral-800"
                                }`}>
                                    {new Date(date).getDate()}
                                </span>
                                <span className={`text-xs font-medium ${
                                    isSelected ? "text-primary-100" : "text-neutral-400"
                                }`}>
                                    {new Date(date).toLocaleDateString("en-IN", { month: "short" })}
                                </span>

                                {/* Slot count badge */}
                                {loading ? (
                                    <div className="w-8 h-4 bg-neutral-200 rounded animate-pulse mt-0.5" />
                                ) : count === null ? null : count === 0 ? (
                                    <span className={`text-xs mt-0.5 ${isSelected ? "text-primary-200" : "text-neutral-400"}`}>
                                        No slots
                                    </span>
                                ) : (
                                    <span className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded-full ${
                                        isSelected
                                            ? "bg-primary-500 text-white"
                                            : "bg-primary-50 text-primary-700"
                                    }`}>
                                        {count} slot{count !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Slot grid for selected date */}
            {selectedDate && (
                <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        Available Time Slots
                        {!loading && (
                            <span className="text-neutral-400 font-normal">
                                ({slotsForSelected.length} available)
                            </span>
                        )}
                    </p>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : slotsForSelected.length === 0 ? (
                        <div className="p-6 text-center bg-neutral-50 text-neutral-500 rounded-lg border border-neutral-100 text-sm">
                            No available time slots on this date. Please select another day.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {slotsForSelected.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => onSlotSelect(slot)}
                                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                        selectedSlot === slot
                                            ? "bg-primary-600 text-white shadow-md tracking-wide"
                                            : "bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                                    }`}
                                >
                                    <Clock className="w-4 h-4" />
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export { DateSlotStrip };
export default DateSlotStrip;
