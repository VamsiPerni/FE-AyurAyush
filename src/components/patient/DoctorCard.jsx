import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, Star, Briefcase, GraduationCap } from "lucide-react";

const DoctorCard = ({ doctor, onSelect, selected }) => {
  const {
    doctorId,
    _id,
    name,
    email,
    specialization,
    qualification,
    experience,
    consultationFee,
    profilePhoto,
    gender,
  } = doctor;

  const id = doctorId || _id;

  return (
    <Card
      hover
      onClick={() => onSelect?.(doctor)}
      className={`flex flex-col gap-3 ${selected ? "ring-2 ring-[#1C7293] border-[#1C7293]" : ""}`}
    >
      <div className="flex items-center gap-3">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={name}
            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#065A82]/10 flex items-center justify-center">
            <User size={24} className="text-[#065A82]" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{name || "Doctor"}</h3>
          <p className="text-sm text-[#1C7293] font-medium">{specialization}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        {qualification && (
          <span className="flex items-center gap-1.5">
            <GraduationCap size={14} className="text-gray-400" />
            {qualification}
          </span>
        )}
        {experience && (
          <span className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-400" />
            {experience} yrs
          </span>
        )}
      </div>

      {consultationFee && (
        <p className="text-sm font-medium text-emerald-600">
          ₹{consultationFee}
        </p>
      )}

      <Button
        variant={selected ? "primary" : "outline"}
        size="sm"
        className="mt-1"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(doctor);
        }}
      >
        {selected ? "Selected ✓" : "Select Doctor"}
      </Button>
    </Card>
  );
};

export { DoctorCard };
