import { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    AlertCircle,
    ShieldAlert,
    Info,
} from "lucide-react";
import { doctorService } from "../../services/doctorService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { showErrorToast, showSuccessToast } from "../../utils/toastMessageHelper";

// Returns array of 7 date strings for days 8–14 from today
const getEditWindow = () => {
    const dates = [];
    for (let i = 8; i <= 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
};

const sortSlots = (slots = []) =>
    [...slots].sort((a, b) => String(a).localeCompare(String(b)));

const AvailabilityManagementPage = () => {
    const editDates = getEditWindow();

    // slotMap: { "YYYY-MM-DD": { slots: [], source: "" } }
    const [slotMap, setSlotMap] = useState({});
    const [loadingMap, setLoadingMap] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    // Editor state for selected date
    const [dateSlots, setDateSlots] = useState([]);
    const [source, setSource] = useState("weekly");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [loadingDate, setLoadingDate] = useState(false);

    // Load all 7 days in parallel on mount
    const loadAllDates = useCallback(async () => {
        setLoadingMap(true);
        try {
            const results = await Promise.all(
                editDates.map((date) =>
                    doctorService.getOwnAvailability(date)
                        .then((res) => ({
                            date,
                            slots: res.data?.dateView?.slots || [],
                            source: res.data?.dateView?.source || "weekly",
                        }))
                        .catch(() => ({ date, slots: [], source: "weekly" }))
                )
            );
            const map = {};
            results.forEach(({ date, slots, source }) => {
                map[date] = { slots, source };
            });
            setSlotMap(map);
        } finally {
            setLoadingMap(false);
        }
    }, []);

    useEffect(() => {
        loadAllDates();
    }, [loadAllDates]);

    const handleDateSelect = async (date) => {
        if (selectedDate === date) {
            setSelectedDate(null);
            return;
        }
        setSelectedDate(date);
        setStartTime("");
        setEndTime("");
        // Use already-loaded data
        const entry = slotMap[date];
        if (entry) {
            setDateSlots(sortSlots(entry.slots));
            setSource(entry.source);
        } else {
            setLoadingDate(true);
            try {
                const res = await doctorService.getOwnAvailability(date);
                const slots = res.data?.dateView?.slots || [];
                const src = res.data?.dateView?.source || "weekly";
                setDateSlots(sortSlots(slots));
                setSource(src);
                setSlotMap((prev) => ({ ...prev, [date]: { slots, source: src } }));
            } catch {
                showErrorToast("Failed to load slots for this date.");
            } finally {
                setLoadingDate(false);
            }
        }
    };

    const handleAddSlotLocally = () => {
        if (!startTime || !endTime) {
            showErrorToast("Please provide both start and end times.");
            return;
        }
        if (startTime >= endTime) {
            showErrorToast("Start time must be earlier than end time.");
            return;
        }
        const slot = `${startTime} - ${endTime}`;
        if (dateSlots.includes(slot)) {
            showErrorToast("This slot already exists for selected date.");
            return;
        }
        setDateSlots((prev) => sortSlots([...prev, slot]));
        setStartTime("");
        setEndTime("");
    };

    const handleSaveDateSlots = async () => {
        try {
            setIsSaving(true);
            await doctorService.setOwnAvailabilityForDate(selectedDate, dateSlots);
            showSuccessToast("Date availability updated successfully.");
            // Refresh this date in the map
            setSlotMap((prev) => ({
                ...prev,
                [selectedDate]: { slots: dateSlots, source: "date_specific" },
            }));
            setSource("date_specific");
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to save date slots.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSlot = async (slot) => {
        try {
            await doctorService.removeOwnAvailabilitySlotForDate(selectedDate, slot);
            showSuccessToast("Slot removed successfully.");
            const updated = dateSlots.filter((s) => s !== slot);
            setDateSlots(updated);
            setSlotMap((prev) => ({
                ...prev,
                [selectedDate]: { slots: updated, source: "date_specific" },
            }));
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to remove slot.");
        }
    };

    const formatDayName = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });

    const formatDayNum = (dateStr) =>
        new Date(dateStr).getDate();

    const formatMonth = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-IN", { month: "short" });

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Manage Availability"
                subtitle="Set your slots for the upcoming week (days 8–14 from today)"
            />

            {/* Info banner */}
            <div className="flex items-start gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    You are managing <strong>days 8 to 14</strong> from today.
                    Days 1–7 are currently visible to patients for booking and cannot be edited.
                </span>
            </div>

            {/* 7-day strip */}
            <Card className="border-primary-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-primary-50/50 border-b border-primary-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-primary-800 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Select a Date to Edit
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={RefreshCw}
                            onClick={loadAllDates}
                            loading={loadingMap}
                        >
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    {loadingMap ? (
                        <div className="grid grid-cols-7 gap-2">
                            {editDates.map((d) => (
                                <div key={d} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {editDates.map((date) => {
                                const count = slotMap[date]?.slots?.length ?? 0;
                                const isSelected = selectedDate === date;
                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        onClick={() => handleDateSelect(date)}
                                        className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all duration-200 ${
                                            isSelected
                                                ? "bg-primary-600 border-primary-600 text-white shadow-md"
                                                : count > 0
                                                  ? "bg-white border-neutral-200 text-neutral-700 hover:border-primary-400 hover:bg-primary-50"
                                                  : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-primary-300 hover:bg-primary-50/50"
                                        }`}
                                    >
                                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                                            isSelected ? "text-primary-100" : "text-neutral-500"
                                        }`}>
                                            {formatDayName(date)}
                                        </span>
                                        <span className={`text-lg font-bold leading-none ${
                                            isSelected ? "text-white" : "text-neutral-800"
                                        }`}>
                                            {formatDayNum(date)}
                                        </span>
                                        <span className={`text-xs ${
                                            isSelected ? "text-primary-100" : "text-neutral-400"
                                        }`}>
                                            {formatMonth(date)}
                                        </span>
                                        <span className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded-full ${
                                            isSelected
                                                ? "bg-primary-500 text-white"
                                                : count > 0
                                                  ? "bg-primary-50 text-primary-700"
                                                  : "bg-neutral-100 text-neutral-400"
                                        }`}>
                                            {count > 0 ? `${count} slot${count !== 1 ? "s" : ""}` : "No slots"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Slot editor — shown only when a date is selected */}
            {selectedDate && (
                <Card className="border-primary-100 shadow-sm overflow-hidden animate-in fade-in">
                    <CardHeader className="bg-primary-50/50 border-b border-primary-100 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-primary-800">
                                Slots for {new Date(selectedDate).toLocaleDateString("en-IN", {
                                    weekday: "long", day: "2-digit", month: "long",
                                })}
                            </CardTitle>
                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg capitalize">
                                Source: {source.replaceAll("_", " ")}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">

                        {/* Add slot row */}
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full sm:w-auto bg-white border border-neutral-300 text-neutral-800 text-sm rounded-lg px-3 py-2"
                            />
                            <span className="text-neutral-400 hidden sm:block">to</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full sm:w-auto bg-white border border-neutral-300 text-neutral-800 text-sm rounded-lg px-3 py-2"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                icon={Plus}
                                className="w-full sm:w-auto"
                                onClick={handleAddSlotLocally}
                            >
                                Add Slot
                            </Button>
                        </div>

                        {/* Slot list */}
                        {loadingDate ? (
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-9 w-32 bg-neutral-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : dateSlots.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                No slots configured for this date yet. Add slots above.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {dateSlots.map((slot) => (
                                    <div
                                        key={slot}
                                        className="flex items-center bg-primary-50 border border-primary-200/60 rounded-lg overflow-hidden"
                                    >
                                        <span className="px-3 py-1.5 text-sm font-semibold text-primary-800 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 opacity-60" />
                                            {slot}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSlot(slot)}
                                            className="px-2 py-1.5 hover:bg-red-100 hover:text-red-600 text-primary-400 transition-colors h-full border-l border-primary-200/60"
                                            title="Remove slot"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 border-t border-neutral-200 flex items-center gap-3">
                            <Button
                                variant="primary"
                                icon={Save}
                                loading={isSaving}
                                onClick={handleSaveDateSlots}
                            >
                                Save Slots
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedDate(null)}
                                disabled={isSaving}
                            >
                                Close
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export { AvailabilityManagementPage };
export default AvailabilityManagementPage;
