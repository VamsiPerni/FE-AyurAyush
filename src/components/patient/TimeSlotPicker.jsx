import { Clock } from "lucide-react";

const TimeSlotPicker = ({ slots = [], selected, onSelect, loading }) => {
    if (loading) {
        return (
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Available Time Slots
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className="h-10 bg-neutral-100 dark:bg-dark-elevated rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                <Clock size={14} />
                Available Time Slots
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                    ({slots.length} available)
                </span>
            </label>

            {slots.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center bg-neutral-50 dark:bg-dark-elevated rounded-xl">
                    No time slots available for this date
                </p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                        <button
                            key={slot}
                            type="button"
                            onClick={() => onSelect(slot)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                                selected === slot
                                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                                    : "bg-white dark:bg-dark-elevated border-neutral-200 dark:border-dark-border text-neutral-700 dark:text-neutral-300 hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-400 dark:hover:text-primary-400"
                            }`}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export { TimeSlotPicker };
