import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, Briefcase, GraduationCap, Sparkles } from "lucide-react";

const DoctorCard = ({ doctor, onSelect, selected, mostlyTreats, isRecommended }) => {
    const {
        name,
        specialization,
        qualification,
        experience,
        consultationFee,
        profilePhoto,
    } = doctor;

    return (
        <div className="relative">
            {isRecommended && (
                <div className="absolute -top-2.5 left-3 z-10 flex items-center gap-1 bg-primary-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    AI Recommended
                </div>
            )}
            <Card
                hover
                selected={selected}
                onClick={() => onSelect?.(doctor)}
                className={`flex flex-col gap-3 ${
                    isRecommended
                        ? "border-primary-300 ring-2 ring-primary-200 bg-primary-50/30"
                        : ""
                }`}
            >
            <div className="flex items-center gap-3">
                {profilePhoto ? (
                    <img
                        src={profilePhoto}
                        alt={name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 dark:border-dark-border"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {name || "Doctor"}
                    </h3>
                    <p className="text-sm text-info-600 dark:text-info-500 font-medium">
                        {specialization}
                    </p>
                    {mostlyTreats && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {mostlyTreats}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                {qualification && (
                    <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                        {qualification}
                    </span>
                )}
                {experience && (
                    <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                        {experience} yrs
                    </span>
                )}
            </div>

            {consultationFee && (
                <p className="text-sm font-medium text-success-600 dark:text-success-500">
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
        </div>
    );
};

export { DoctorCard };
export default DoctorCard;
