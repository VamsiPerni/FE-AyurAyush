import { useState, useEffect } from "react";
import { DoctorApplicationReview } from "../../components/admin/DoctorApplicationReview";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { adminService } from "../../services/adminService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import { UserCheck, RefreshCw } from "lucide-react";

const DoctorApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const result = await adminService.getDoctorApplications();
            setApplications(result.data?.applications || []);
        } catch {
            showErrorToast("Failed to load doctor applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const handleApprove = async (id) => {
        try {
            await adminService.approveDoctorApplication(id);
            showSuccessToast("Doctor application approved!");
            setApplications((prev) =>
                prev.map((a) =>
                    (a.applicationId || a._id) === id
                        ? { ...a, status: "approved" }
                        : a,
                ),
            );
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to approve");
        }
    };

    const handleReject = async (id) => {
        try {
            await adminService.rejectDoctorApplication(id);
            showSuccessToast("Doctor application rejected");
            setApplications((prev) =>
                prev.map((a) =>
                    (a.applicationId || a._id) === id
                        ? { ...a, status: "rejected" }
                        : a,
                ),
            );
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to reject");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck size={24} className="text-[#065A82]" />
                    Doctor Applications
                </h1>
                <Button variant="outline" size="sm" onClick={loadApplications}>
                    <RefreshCw size={14} /> Refresh
                </Button>
            </div>

            {loading ? (
                <LoadingSkeleton type="card" count={3} />
            ) : applications.length === 0 ? (
                <EmptyState
                    icon="users"
                    title="No doctor applications"
                    description="No pending applications at this time"
                />
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <DoctorApplicationReview
                            key={app.applicationId || app._id}
                            application={app}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { DoctorApplicationsPage };
