import { useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { GraduationCap, Briefcase, Award, FileText, User } from "lucide-react";

const DoctorApplicationReview = ({ application, onApprove, onReject }) => {
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null);

    const handleApprove = async () => {
        setAction("approve");
        setLoading(true);
        await onApprove(application.applicationId || application._id);
        setLoading(false);
    };

    const handleReject = async () => {
        setAction("reject");
        setLoading(true);
        await onReject(application.applicationId || application._id);
        setLoading(false);
    };

    return (
        <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary-600/10 flex items-center justify-center">
                        <User size={20} className="text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {application.userId?.name ||
                                application.name ||
                                "Applicant"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {application.userId?.email || application.email}
                        </p>
                    </div>
                </div>
                <Badge variant={application.status || "pending"}>
                    {application.status || "Pending"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap size={14} className="text-gray-400" />
                    <span>
                        <span className="font-medium">Qualification:</span>{" "}
                        {application.qualification}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Award size={14} className="text-gray-400" />
                    <span>
                        <span className="font-medium">Specialization:</span>{" "}
                        {application.specialization}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase size={14} className="text-gray-400" />
                    <span>
                        <span className="font-medium">Experience:</span>{" "}
                        {application.experience} years
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <FileText size={14} className="text-gray-400" />
                    <span>
                        <span className="font-medium">License:</span>{" "}
                        {application.licenseNumber}
                    </span>
                </div>
            </div>

            {(!application.status || application.status === "pending") && (
                <div className="flex gap-2 pt-2 border-t border-gray-100 mt-1">
                    <Button
                        size="sm"
                        variant="success"
                        onClick={handleApprove}
                        loading={loading && action === "approve"}
                        disabled={loading}
                    >
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={handleReject}
                        loading={loading && action === "reject"}
                        disabled={loading}
                    >
                        Reject
                    </Button>
                </div>
            )}
        </Card>
    );
};

export { DoctorApplicationReview };
