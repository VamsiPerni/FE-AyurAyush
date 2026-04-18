import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
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
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/shared/PageHeader";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
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

const getEditWindowDates = () => {
    const min = new Date();
    min.setDate(min.getDate() + 8);
    const max = new Date();
    max.setDate(max.getDate() + 14);
    return {
        minDate: min.toISOString().slice(0, 10),
        maxDate: max.toISOString().slice(0, 10),
        defaultDate: min.toISOString().slice(0, 10),
    };
};

const sortSlots = (slots = []) =>
    [...slots].sort((a, b) => String(a).localeCompare(String(b)));

const DoctorAvailabilityPage = () => {
    const navigate = useNavigate();
    const { doctorId: routeDoctorId } = useParams();

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState(
        routeDoctorId || "",
    );
    const { minDate, maxDate, defaultDate } = getEditWindowDates();
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [dateSlots, setDateSlots] = useState([]);
    const [source, setSource] = useState("weekly");
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const loadDoctors = useCallback(async () => {
        const result = await adminService.getDoctors();
        const list = result?.data?.doctors || result?.data || [];
        setDoctors(Array.isArray(list) ? list : []);
    }, []);

    const loadAvailabilityForDate = useCallback(async (doctorId, dateValue) => {
        if (!doctorId) {
            setDateSlots([]);
            setSource("weekly");
            return;
        }

        const result = await adminService.getDoctorAvailability(
            doctorId,
            dateValue,
        );
        const dateView = result?.data?.dateView || null;
        const slots = Array.isArray(dateView?.slots) ? dateView.slots : [];
        setDateSlots(sortSlots(slots));
        setSource(dateView?.source || "weekly");
    }, []);

    useEffect(() => {
        const initialize = async () => {
            try {
                setLoadingInitial(true);
                setError("");
                await loadDoctors();
            } catch (err) {
                setError("Failed to load doctor availability data.");
                showErrorToast(
                    err.response?.data?.message ||
                        "Failed to load availability.",
                );
            } finally {
                setLoadingInitial(false);
            }
        };

        initialize();
    }, [loadDoctors]);

    useEffect(() => {
        const syncDateAvailability = async () => {
            const activeDoctorId = routeDoctorId || selectedDoctorId;
            try {
                setError("");
                await loadAvailabilityForDate(activeDoctorId, selectedDate);
            } catch (err) {
                setError("Failed to load doctor availability data.");
                showErrorToast(
                    err.response?.data?.message ||
                        "Failed to load availability.",
                );
            }
        };

        syncDateAvailability();
    }, [
        loadAvailabilityForDate,
        routeDoctorId,
        selectedDoctorId,
        selectedDate,
    ]);

    useEffect(() => {
        if (routeDoctorId) {
            setSelectedDoctorId(routeDoctorId);
        }
    }, [routeDoctorId]);

    const handleDoctorChange = (e) => {
        const nextDoctorId = e.target.value;
        setSelectedDoctorId(nextDoctorId);
        if (nextDoctorId) {
            navigate(
                `/admin/doctors/${encodeURIComponent(nextDoctorId)}/availability`,
            );
            return;
        }
        setDateSlots([]);
        setSource("weekly");
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
        if (!selectedDoctorId) {
            showErrorToast("Please select a doctor first.");
            return;
        }

        try {
            setIsSaving(true);
            await adminService.setDoctorAvailabilityForDate(selectedDoctorId, {
                date: selectedDate,
                slots: dateSlots,
            });
            showSuccessToast("Date availability updated successfully.");
            await loadAvailabilityForDate(selectedDoctorId, selectedDate);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to save date slots.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSlot = async (slot) => {
        if (!selectedDoctorId) return;
        try {
            await adminService.removeDoctorAvailabilitySlotForDate(
                selectedDoctorId,
                {
                    date: selectedDate,
                    slot,
                },
            );
            showSuccessToast("Slot removed successfully.");
            setDateSlots((prev) => prev.filter((item) => item !== slot));
            await loadAvailabilityForDate(selectedDoctorId, selectedDate);
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
                    title="Doctor Availability"
                    subtitle="Loading date-wise availability..."
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
                                loadAvailabilityForDate(
                                    selectedDoctorId,
                                    selectedDate,
                                )
                            }
                        >
                            Retry Operation
                        </Button>
                    }
                />
            </div>
        );
    }

    const doctorOptions = [
        { value: "", label: "Select a Doctor..." },
        ...doctors.map((d) => ({
            value: d._id || d.doctorId,
            label: `Dr. ${d.name} (${d.specialization || "General"})`,
        })),
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Doctor Availability"
                subtitle="Manage date-specific slots with the same rules used in the doctor panel."
            />

            <Card className="border-neutral-200 dark:border-dark-border shadow-sm overflow-visible z-10 relative">
                <CardContent className="p-6">
                    <Select
                        label="Target Doctor"
                        id="doctor-selector"
                        icon={Calendar}
                        options={doctorOptions}
                        value={selectedDoctorId}
                        onChange={handleDoctorChange}
                        disabled={isSaving}
                    />
                </CardContent>
            </Card>

            {!selectedDoctorId ? (
                <Card className="border-neutral-100 dark:border-dark-border shadow-none bg-neutral-50/50 dark:bg-dark-elevated/50">
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-white dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-dark-border shadow-sm">
                            <Clock className="w-8 h-8 text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
                            Select a Practitioner First
                        </h3>
                        <p className="text-neutral-500 text-sm mt-1">
                            Pick a doctor to modify upcoming date-based slots.
                        </p>
                    </div>
                </Card>
            ) : (
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
                                    min={minDate}
                                    max={maxDate}
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
                            You can only manage availability for <strong>days 8 to 14 from today</strong>. Days 1–7 are visible to patients for booking and are locked.
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
                                            onClick={() =>
                                                handleRemoveSlot(slot)
                                            }
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
            )}
        </div>
    );
};

export { DoctorAvailabilityPage };
export default DoctorAvailabilityPage;
