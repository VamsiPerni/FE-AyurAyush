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
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

// Returns array of 15 date strings for today through day 14
const getEditWindow = () => {
    const dates = [];
    for (let i = 0; i <= 14; i++) {
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
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Load all 7 days in parallel on mount
    const loadAllDates = useCallback(async () => {
        setLoadingMap(true);
        try {
            const results = await Promise.all(
                editDates.map((date) =>
                    doctorService
                        .getOwnAvailability(date)
                        .then((res) => ({
                            date,
                            slots: res.data?.dateView?.slots || [],
                            source: res.data?.dateView?.source || "weekly",
                        }))
                        .catch(() => ({ date, slots: [], source: "weekly" })),
                ),
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
                setSlotMap((prev) => ({
                    ...prev,
                    [date]: { slots, source: src },
                }));
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

    const isLockedDate = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.round((d - today) / (24 * 60 * 60 * 1000));
        return diffDays >= 0 && diffDays <= 7;
    };

    const doSave = async () => {
        try {
            setIsSaving(true);
            await doctorService.setOwnAvailabilityForDate(
                selectedDate,
                dateSlots,
            );
            showSuccessToast("Date availability updated successfully.");
            setSlotMap((prev) => ({
                ...prev,
                [selectedDate]: { slots: dateSlots, source: "date_specific" },
            }));
            setSource("date_specific");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to save date slots.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDateSlots = () => {
        if (isLockedDate(selectedDate)) {
            setConfirmOpen(true);
        } else {
            doSave();
        }
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        await doSave();
    };

    const handleRemoveSlot = async (slot) => {
        try {
            await doctorService.removeOwnAvailabilitySlotForDate(
                selectedDate,
                slot,
            );
            showSuccessToast("Slot removed successfully.");
            const updated = dateSlots.filter((s) => s !== slot);
            setDateSlots(updated);
            setSlotMap((prev) => ({
                ...prev,
                [selectedDate]: { slots: updated, source: "date_specific" },
            }));
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to remove slot.",
            );
        }
    };

    const formatDayName = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });

    const formatDayNum = (dateStr) => new Date(dateStr).getDate();

    const formatMonth = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-IN", { month: "short" });

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Manage Availability"
                subtitle="Set your slots for today through the next 14 days"
            />

            {/* Info banner */}
            <div className="flex items-start gap-2 text-sm text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/15 border border-primary-200 dark:border-primary-700/40 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    You can add slots for <strong>today through day 14</strong>.
                    Slots within <strong>today to day 7</strong> cannot be
                    removed once added. Days 8–14 keep the existing removal
                    checks.
                </span>
            </div>

            {/* 7-day strip */}
            <Card className="border-primary-100 dark:border-dark-border shadow-sm overflow-hidden">
                <CardHeader className="bg-primary-50/50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-dark-border pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-primary-800 dark:text-primary-300 flex items-center gap-2">
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
                        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                            {editDates.map((d) => (
                                <div
                                    key={d}
                                    className="h-24 bg-neutral-100 dark:bg-dark-elevated rounded-xl animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
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
                                                  ? "bg-white dark:bg-dark-card border-neutral-200 dark:border-dark-border text-neutral-700 dark:text-neutral-200 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                  : "bg-neutral-50 dark:bg-dark-elevated border-neutral-100 dark:border-dark-border text-neutral-400 dark:text-neutral-500 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
                                        }`}
                                    >
                                        <span
                                            className={`text-xs font-semibold uppercase tracking-wide ${
                                                isSelected
                                                    ? "text-primary-100"
                                                    : "text-neutral-500 dark:text-neutral-400"
                                            }`}
                                        >
                                            {formatDayName(date)}
                                        </span>
                                        <span
                                            className={`text-lg font-bold leading-none ${
                                                isSelected
                                                    ? "text-white"
                                                    : "text-neutral-800 dark:text-neutral-100"
                                            }`}
                                        >
                                            {formatDayNum(date)}
                                        </span>
                                        <span
                                            className={`text-xs ${
                                                isSelected
                                                    ? "text-primary-100"
                                                    : "text-neutral-400 dark:text-neutral-500"
                                            }`}
                                        >
                                            {formatMonth(date)}
                                        </span>
                                        <span
                                            className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded-full ${
                                                isSelected
                                                    ? "bg-primary-500 text-white"
                                                    : count > 0
                                                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                                      : "bg-neutral-100 dark:bg-dark-hover text-neutral-400 dark:text-neutral-500"
                                            }`}
                                        >
                                            {count > 0
                                                ? `${count} slot${count !== 1 ? "s" : ""}`
                                                : "No slots"}
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
                <Card className="border-primary-100 dark:border-dark-border shadow-sm overflow-hidden animate-in fade-in">
                    <CardHeader className="bg-primary-50/50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-dark-border pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-primary-800 dark:text-primary-300">
                                Slots for{" "}
                                {new Date(selectedDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                    },
                                )}
                            </CardTitle>
                            <span className="text-xs text-neutral-500 dark:text-neutral-300 bg-neutral-100 dark:bg-dark-elevated px-2.5 py-1 rounded-lg capitalize border border-transparent dark:border-dark-border">
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
                                className="w-full sm:w-auto bg-white dark:bg-dark-card border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg px-3 py-2"
                            />
                            <span className="text-neutral-400 dark:text-neutral-500 hidden sm:block">
                                to
                            </span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full sm:w-auto bg-white dark:bg-dark-card border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg px-3 py-2"
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
                                    <div
                                        key={i}
                                        className="h-9 w-32 bg-neutral-100 dark:bg-dark-elevated rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : dateSlots.length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                No slots configured for this date yet. Add slots
                                above.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {dateSlots.map((slot) => (
                                    <div
                                        key={slot}
                                        className="flex items-center bg-primary-50 dark:bg-primary-900/15 border border-primary-200/60 dark:border-primary-700/40 rounded-lg overflow-hidden"
                                    >
                                        <span className="px-3 py-1.5 text-sm font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 opacity-60" />
                                            {slot}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSlot(slot)
                                            }
                                            className="px-2 py-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 text-primary-400 dark:text-primary-500 transition-colors h-full border-l border-primary-200/60 dark:border-primary-700/40"
                                            title="Remove slot"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 border-t border-neutral-200 dark:border-dark-border flex items-center gap-3">
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

            {/* Confirmation modal for locked dates (today – day 7) */}
            <Modal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Confirm Slot Save"
                size="sm"
                footer={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setConfirmOpen(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            loading={isSaving}
                            onClick={handleConfirmSave}
                        >
                            Yes, Save Slots
                        </Button>
                    </div>
                }
            >
                <div className="flex items-start gap-3 py-1">
                    <ShieldAlert className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-neutral-800">
                            This date is within the locked window (today – day 7).
                        </p>
                        <p className="text-sm text-neutral-600">
                            Once saved, these slots <strong>cannot be removed</strong>. Patients may book them immediately.
                        </p>
                        <p className="text-sm text-neutral-600">
                            Saving <strong>{dateSlots.length} slot{dateSlots.length !== 1 ? "s" : ""}</strong> for{" "}
                            <strong>
                                {selectedDate && new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}
                            </strong>.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export { AvailabilityManagementPage };
export default AvailabilityManagementPage;
