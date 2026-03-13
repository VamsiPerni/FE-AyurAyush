import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { patientService } from "../../services/patientService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import { Users, User, GraduationCap, Briefcase, Search } from "lucide-react";
import { useNavigate } from "react-router";

const ManageDoctorsPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const result = await patientService.getDoctors("");
      setDoctors(result.data?.doctors || []);
    } catch {
      showErrorToast("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(
    (d) =>
      !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} className="text-[#065A82]" />
          Manage Doctors
        </h1>
        <Badge variant="info">{doctors.length} doctors</Badge>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctors by name or specialization..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="users" title="No doctors found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card
              key={doc.doctorId || doc._id}
              hover
              onClick={() =>
                navigate(
                  `/admin/doctors/${doc.doctorId || doc._id}/availability`,
                )
              }
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                {doc.profilePhoto ? (
                  <img
                    src={doc.profilePhoto}
                    alt={doc.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#065A82]/10 flex items-center justify-center">
                    <User size={20} className="text-[#065A82]" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{doc.name}</p>
                  <p className="text-sm text-[#1C7293] font-medium">
                    {doc.specialization}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {doc.qualification && (
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} /> {doc.qualification}
                  </span>
                )}
                {doc.experience && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} /> {doc.experience} yrs
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Click to manage availability →
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { ManageDoctorsPage };
