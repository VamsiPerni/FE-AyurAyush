import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";

const SubAdminDashboardPage = () => {
    const navigate = useNavigate();
    const { subAdminProfile } = useAuthContext();

    useEffect(() => {
        const perms = subAdminProfile?.permissions || {};
        if (perms.viewQueues || perms.viewEmergencyQueue || perms.viewOverdue || perms.viewPastAppointments) {
            navigate("/admin/queues", { replace: true });
        } else if (perms.viewDoctors || perms.manageAvailability) {
            navigate("/admin/doctors", { replace: true });
        } else if (perms.offlineBooking) {
            navigate("/admin/offline-booking", { replace: true });
        } else if (perms.viewDoctorApplications) {
            navigate("/admin/doctor-applications", { replace: true });
        } else {
            navigate("/admin/queues", { replace: true });
        }
    }, [navigate, subAdminProfile]);

    return null;
};

export { SubAdminDashboardPage };
export default SubAdminDashboardPage;
