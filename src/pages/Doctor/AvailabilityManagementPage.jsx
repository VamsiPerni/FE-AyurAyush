import { useState, useEffect, useCallback } from "react";
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    AlertCircle,
    ShieldAlert,
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
import { EmptyState } from "../../components/ui/EmptyState";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
};

const sortSlots = (slots = []) =>
    [...slots].sort((a, b) => String(a).localeCompare(String(b)));

const AvailabilityManagementPage = () => {
    const [selectedDate, setSelectedDate] = useState(getTomorrowDateString());
    const [dateSlots, setDateSlots] = useState([]);
    const [source, setSource] = useState("weekly");
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const loadAvailabilityForDate = useCallback(async (dateValue) => {
        try {
            setLoadingInitial(true);
            setError("");
            const result = await doctorService.getOwnAvailability(dateValue);
            const dateView = result.data?.dateView || null;
            const slots = Array.isArray(dateView?.slots) ? dateView.slots : [];
            setDateSlots(sortSlots(slots));
            setSource(dateView?.source || "weekly");
        } catch (err) {
            setError(
                "Failed to fetch your availability for the selected date.",
            );
            showErrorToast(
                err.response?.data?.message || "Failed to load availability.",
            );
        } finally {
            setLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        loadAvailabilityForDate(selectedDate);
    }, [selectedDate, loadAvailabilityForDate]);

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
            await doctorService.setOwnAvailabilityForDate(
                selectedDate,
                dateSlots,
            );
            showSuccessToast("Date availability updated successfully.");
            await loadAvailabilityForDate(selectedDate);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to save date slots.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSlot = async (slot) => {
        try {
            await doctorService.removeOwnAvailabilitySlotForDate(
                selectedDate,
                slot,
            );
            showSuccessToast("Slot removed successfully.");
            setDateSlots((prev) => prev.filter((item) => item !== slot));
            await loadAvailabilityForDate(selectedDate);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to remove slot.",
            );
        }
    };

    if (loadingInitial) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Manage Availability"
                    subtitle="Loading date-wise schedule..."
                />
                <Card className="p-12 border-neutral-100 flex items-center justify-center">
                    <div className="h-40 w-full animate-pulse bg-neutral-50/50 rounded-lg" />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Data Synchronization Error"
                    description={error}
                    action={
                        <Button
                            icon={RefreshCw}
                            onClick={() =>
                                loadAvailabilityForDate(selectedDate)
                            }
                        >
                            Retry Operation
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Manage Availability"
                subtitle="Set date-specific slots for upcoming dates."
            />

            <Card className="border-primary-100 dark:border-dark-border shadow-sm overflow-hidden">
                <CardHeader className="bg-primary-50/50 dark:bg-primary-900/10 border-b border-primary-50 dark:border-dark-border pb-4">
                    <CardTitle className="text-primary-800 dark:text-primary-300 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Date-Specific Slot Manager
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Select Date
                            </label>
                            <input
                                type="date"
                                min={new Date().toISOString().slice(0, 10)}
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="w-full bg-white dark:bg-dark-elevated border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="w-full text-sm bg-neutral-50 dark:bg-dark-elevated border border-neutral-200 dark:border-dark-border rounded-lg px-3 py-2.5 text-neutral-600 dark:text-neutral-300">
                                Source:{" "}
                                <span className="font-semibold capitalize">
                                    {source.replaceAll("_", " ")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 mt-0.5" />
                        Slot removal is allowed only when the selected
                        appointment date is at least 7 days away and no patient
                        is booked in that slot.
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full sm:w-auto bg-white dark:bg-dark-elevated border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg px-3 py-2"
                        />
                        <span className="text-neutral-400 hidden sm:block">
                            to
                        </span>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full sm:w-auto bg-white dark:bg-dark-elevated border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg px-3 py-2"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            icon={Plus}
                            className="w-full sm:w-auto"
                            onClick={handleAddSlotLocally}
                        >
                            Add Timing
                        </Button>
                    </div>

                    {dateSlots.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            No slots configured for this date yet.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {dateSlots.map((slot) => (
                                <div
                                    key={slot}
                                    className="flex items-center bg-primary-50 dark:bg-primary-900/10 border border-primary-200/60 dark:border-primary-700/40 rounded-lg overflow-hidden"
                                >
                                    <span className="px-3 py-1.5 text-sm font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
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

                    <div className="pt-4 border-t border-neutral-200 dark:border-dark-border">
                        <Button
                            variant="primary"
                            icon={Save}
                            loading={isSaving}
                            onClick={handleSaveDateSlots}
                        >
                            Save Slots For Date
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export { AvailabilityManagementPage };
export default AvailabilityManagementPage;
