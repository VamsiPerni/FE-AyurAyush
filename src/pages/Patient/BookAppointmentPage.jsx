import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DoctorCard } from "../../components/patient/DoctorCard";
import { BookingModal } from "../../components/patient/BookingModal";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { patientService } from "../../services/patientService";
import { chatService } from "../../services/chatService";
import { showErrorToast } from "../../utils/toastMessageHelper";
import { Search, Filter } from "lucide-react";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Orthopedic",
  "Dermatologist",
  "ENT Specialist",
  "Pediatrician",
  "Gynecologist",
  "Psychiatrist",
  "Dentist",
  "Ophthalmologist",
  "Gastroenterologist",
];

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
    loadConversations();
  }, []);

  const loadDoctors = async (specialization = "") => {
    try {
      setLoading(true);
      const result = await patientService.getDoctors(specialization);
      setDoctors(result.data?.doctors || []);
    } catch {
      showErrorToast("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const result = await chatService.getConversations();
      const completed = (result.data?.conversations || []).filter(
        (c) => c.status === "completed" && !c.appointmentId,
      );
      setConversations(completed);
    } catch {
      // Silently fail
    }
  };

  const handleFilter = (spec) => {
    setFilter(spec);
    loadDoctors(spec);
  };

  const handleSelectDoctor = (doctor) => {
    if (!selectedConversation) {
      showErrorToast(
        "Please select a completed consultation or start a new chat first",
      );
      return;
    }
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <Button variant="outline" onClick={() => navigate("/patient/chatbot")}>
          Start AI Consultation First
        </Button>
      </div>

      {/* Conversation selector */}
      {conversations.length > 0 && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <label className="block text-sm font-medium text-teal-800 mb-2">
            Select a completed consultation to book from:
          </label>
          <select
            value={selectedConversation}
            onChange={(e) => setSelectedConversation(e.target.value)}
            className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm bg-white"
          >
            <option value="">Select consultation...</option>
            {conversations.map((c) => (
              <option
                key={c.conversationId || c._id}
                value={c.conversationId || c._id}
              >
                {c.summary?.symptoms?.join(", ") || "Consultation"} —{" "}
                {new Date(c.createdAt).toLocaleDateString()}
                {c.summary?.recommendedSpecialist
                  ? ` (Recommended: ${c.summary.recommendedSpecialist})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {conversations.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          No completed consultations found.{" "}
          <button
            onClick={() => navigate("/patient/chatbot")}
            className="underline font-medium"
          >
            Start a chat with AI
          </button>{" "}
          first to book an appointment.
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        <button
          onClick={() => handleFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !filter
              ? "bg-[#065A82] text-white border-[#065A82]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7293]"
          }`}
        >
          All
        </button>
        {SPECIALIZATIONS.map((spec) => (
          <button
            key={spec}
            onClick={() => handleFilter(spec)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === spec
                ? "bg-[#065A82] text-white border-[#065A82]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1C7293]"
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon="users"
          title="No doctors found"
          description="Try a different specialization"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.doctorId || doc._id}
              doctor={doc}
              onSelect={handleSelectDoctor}
            />
          ))}
        </div>
      )}

      {selectedDoctor && (
        <BookingModal
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          conversationId={selectedConversation}
          summary={
            conversations.find(
              (c) => (c.conversationId || c._id) === selectedConversation,
            )?.summary
          }
          onBooked={() => {
            setShowBooking(false);
            navigate("/patient/appointments");
          }}
        />
      )}
    </div>
  );
};

export { BookAppointmentPage };
