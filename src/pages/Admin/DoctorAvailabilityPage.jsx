import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
    Clock,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    AlertCircle,
    ShieldAlert,
    Calendar,
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

// Admin window: days 8–14 from today (days 1–7 are locked for patients)
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

const DoctorAvailabilityPage = () => {
    const navigate = useNavigate();
    const { doctorId: routeDoctorId } = useParams();

    const editDates = getEditWindow();

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState(routeDoctorId || "");
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [doctorsError, setDoctorsError] = useState("");

    // slotMap: { "YYYY-MM-DD": { slots: [], source: "" } }
    const [slotMap, setSlotMap] = useState({});
    const [loadingMap, setLoadingMap] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Editor state for selected date
    const [dateSlots, setDateSlots] = useState([]);
    const [source, setSource] = useState("weekly");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [loadingDate, setLoadingDate] = useState(false);

    // Load doctors list on mount
    const loadDoctors = useCallback(async () => {
        try {
            setLoadingDoctors(true);
            setDoctorsError("");
            const result = await adminService.getDoctors();
            const list = result?.data?.doctors || result?.data || [];
            setDoctors(Array.isArray(list) ? list : []);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to load doctors.";
            setDoctorsError(msg);
            showErrorToast(msg);
        } finally {
            setLoadingDoctors(false);
        }
    }, []);

    useEffect(() => {
        loadDoctors();
    }, [loadDoctors]);

    useEffect(() => {
        if (routeDoctorId) setSelectedDoctorId(routeDoctorId);
    }, [routeDoctorId]);

    // Load all 7 dates in parallel for the selected doctor
    const loadAllDates = useCallback(async (doctorId) => {
        if (!doctorId) return;
        setLoadingMap(true);
        try {
            const results = await Promise.all(
                editDates.map((date) =>
                    adminService
                        .getDoctorAvailability(doctorId, date)
                        .then((res) => ({
                            date,
                            slots: res?.data?.dateView?.slots || [],
                            source: res?.data?.dateView?.source || "weekly",
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
        if (selectedDoctorId) {
            setSelectedDate(null);
            setDateSlots([]);
            setSource("weekly");
            loadAllDates(selectedDoctorId);
        } else {
            setSlotMap({});
            setSelectedDate(null);
        }
    }, [selectedDoctorId, loadAllDates]);

    const handleDoctorChange = (e) => {
        const nextId = e.target.value;
        setSelectedDoctorId(nextId);
        if (nextId) {
            navigate(`/admin/doctors/${encodeURIComponent(nextId)}/availability`);
        }
    };

    const handleDateSelect = async (date) => {
        if (selectedDate === date) {
            setSelectedDate(null);
            return;
        }
        setSelectedDate(date);
        setStartTime("");
        setEndTime("");
        const entry = slotMap[date];
        if (entry) {
            setDateSlots(sortSlots(entry.slots));
            setSource(entry.source);
        } else {
            setLoadingDate(true);
            try {
                const res = await adminService.getDoctorAvailability(selectedDoctorId, date);
                const slots = res?.data?.dateView?.slots || [];
                const src = res?.data?.dateView?.source || "weekly";
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
        if (!selectedDoctorId) return;
        try {
            await adminService.removeDoctorAvailabilitySlotForDate(selectedDoctorId, {
                date: selectedDate,
                slot,
            });
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
    const formatDayNum = (dateStr) => new Date(dateStr).getDate();
    const formatMonth = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-IN", { month: "short" });

    if (loadingDoctors) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Doctor Availability"
                    subtitle="Loading doctors..."
                />
                <Card className="p-12 border-neutral-100 flex items-center justify-center">
                    <div className="h-40 w-full animate-pulse bg-neutral-50/50 rounded-lg" />
                </Card>
            </div>
        );
    }

    if (doctorsError) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Failed to load doctors"
                    description={doctorsError}
                    action={
                        <Button icon={RefreshCw} onClick={loadDoctors}>
                            Retry
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
                subtitle="Manage date-specific slots for days 8–14 ahead"
                backTo="/admin/doctors"
            />

            {/* Info banner */}
            <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    Admin can only manage availability for{" "}
                    <strong>days 8 to 14 from today</strong>. Days 1–7 are
                    visible to patients for booking and are locked.
                </span>
            </div>

            {/* Doctor selector */}
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
                <>
                    {/* 7-day strip (days 8–14) */}
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
                                    onClick={() => loadAllDates(selectedDoctorId)}
                                    loading={loadingMap}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            {loadingMap ? (
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {editDates.map((d) => (
                                        <div
                                            key={d}
                                            className="h-24 bg-neutral-100 dark:bg-dark-elevated rounded-xl animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                                        No slots configured for this date yet. Add slots above.
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
                                                    onClick={() => handleRemoveSlot(slot)}
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
                </>
            )}
        </div>
    );
};

export { DoctorAvailabilityPage };
export default DoctorAvailabilityPage;
