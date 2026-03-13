import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AppointmentList } from "../../components/doctor/AppointmentList";
import { Badge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { doctorService } from "../../services/doctorService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import { Calendar, Filter, AlertTriangle } from "lucide-react";

const STATUSES = ["", "confirmed", "completed", "cancelled"];
const STATUS_LABELS = {
  "": "All",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const AllAppointmentsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await doctorService.getAppointments(
        statusFilter,
        dateFilter,
      );
      setData(result.data);
    } catch {
      showErrorToast("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter]);

  const emergencyAppointments = data?.emergencyAppointments || [];
  const normalAppointments = data?.normalAppointments || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
        <div className="flex items-center gap-3 text-sm">
          {data && (
            <>
              <Badge variant="info">Total: {data.totalCount || 0}</Badge>
              {data.emergencyCount > 0 && (
                <Badge variant="emergency">
                  Emergency: {data.emergencyCount}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-[#065A82] text-white border-[#065A82]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7293]"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-xs text-red-500 underline"
          >
            Clear date
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="space-y-8">
          {emergencyAppointments.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle size={18} />
                Emergency Appointments
              </h2>
              <AppointmentList
                appointments={emergencyAppointments}
                onSelect={(id) => navigate(`/doctor/appointments/${id}`)}
              />
            </div>
          )}

          <AppointmentList
            title="Appointments"
            appointments={normalAppointments}
            onSelect={(id) => navigate(`/doctor/appointments/${id}`)}
            emptyMessage="No appointments found"
          />
        </div>
      )}
    </div>
  );
};

export { AllAppointmentsPage };
