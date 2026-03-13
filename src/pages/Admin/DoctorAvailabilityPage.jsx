import { useParams, useNavigate } from "react-router";
import { DoctorAvailabilityManager } from "../../components/admin/DoctorAvailabilityManager";
import { Button } from "../../components/ui/Button";
import { ArrowLeft } from "lucide-react";

const DoctorAvailabilityPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate("/admin/doctors")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} /> Back to Doctors
      </button>

      <DoctorAvailabilityManager
        doctorId={doctorId}
        onSaved={() => navigate("/admin/doctors")}
      />
    </div>
  );
};

export { DoctorAvailabilityPage };
