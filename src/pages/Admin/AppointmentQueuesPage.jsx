import { EmergencyQueue } from "../../components/admin/EmergencyQueue";
import { NormalQueue } from "../../components/admin/NormalQueue";
import { ClipboardList, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

const AppointmentQueuesPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList size={24} className="text-[#065A82]" />
          Appointment Queues
        </h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <EmergencyQueue
        key={`emergency-${refreshKey}`}
        onRefresh={handleRefresh}
      />
      <NormalQueue key={`normal-${refreshKey}`} onRefresh={handleRefresh} />
    </div>
  );
};

export { AppointmentQueuesPage };
