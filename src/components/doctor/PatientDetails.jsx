import { Card, CardHeader, CardTitle } from "../ui/Card";
import {
    User,
    Phone,
    Mail,
    Droplets,
    AlertCircle,
    FileText,
    Heart,
} from "lucide-react";

const PatientDetails = ({ patient }) => {
    if (!patient) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User size={18} className="text-[#065A82]" />
                    Patient Information
                </CardTitle>
            </CardHeader>

            <div className="flex items-center gap-4 mb-4">
                {patient.profilePhoto ? (
                    <img
                        src={patient.profilePhoto}
                        alt={patient.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[#065A82]/10 flex items-center justify-center">
                        <User size={28} className="text-[#065A82]" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                        {patient.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {patient.gender}
                        {patient.age ? `, ${patient.age} years` : ""}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <span>{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{patient.phone || "N/A"}</span>
                </div>
                {patient.bloodGroup && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Droplets size={14} className="text-red-400" />
                        <span>Blood Group: {patient.bloodGroup}</span>
                    </div>
                )}
                {patient.allergies?.length > 0 && (
                    <div className="flex items-start gap-2 text-gray-600">
                        <AlertCircle
                            size={14}
                            className="text-amber-400 mt-0.5"
                        />
                        <div>
                            <span className="font-medium">Allergies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {patient.allergies.map((a, i) => (
                                    <span
                                        key={i}
                                        className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs"
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {patient.medicalHistory?.length > 0 && (
                    <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                        <FileText size={14} className="text-gray-400 mt-0.5" />
                        <div>
                            <span className="font-medium">
                                Medical History:
                            </span>
                            <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
                                {patient.medicalHistory.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                {patient.emergencyContact && (
                    <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                        <Heart size={14} className="text-red-400" />
                        <span>
                            Emergency Contact: {patient.emergencyContact.name} —{" "}
                            {patient.emergencyContact.phone}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export { PatientDetails };
