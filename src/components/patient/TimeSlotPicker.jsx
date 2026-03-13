import { Clock } from "lucide-react";

const TimeSlotPicker = ({ slots = [], selected, onSelect, loading }) => {
  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Time Slots
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
        <Clock size={14} />
        Available Time Slots
        <span className="text-gray-400 font-normal">
          ({slots.length} available)
        </span>
      </label>

      {slots.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
          No time slots available for this date
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                selected === slot
                  ? "bg-[#065A82] text-white border-[#065A82] shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[#1C7293] hover:text-[#1C7293]"
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
