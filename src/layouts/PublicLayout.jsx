import { Navigate, Outlet, useLocation } from "react-router";
import { Navbar } from "../components/Navbar";
import { PageLoader } from "../components/ui/Spinner";
import { useAuthContext } from "../contexts/AppContext";

const PublicLayout = () => {
    const { isLoggedIn, loading, activeRole, roles, mustChangePassword } =
        useAuthContext();
    const location = useLocation();
    const isHomePath = location.pathname === "/";

    // Show loader while checking auth via GET /auth/me
    if (loading) return <PageLoader />;

    // Already authenticated → redirect to correct destination (except homepage)
    if (isLoggedIn && !isHomePath) {
        if (mustChangePassword)
            return <Navigate to="/change-password" replace />;

        if (activeRole) {
            const routes = {
                patient: "/patient/dashboard",
                doctor: "/doctor/dashboard",
                admin: "/admin/dashboard",
            };
            const from = location.state?.from?.pathname;
            return <Navigate to={from || routes[activeRole]} replace />;
        }

        if (roles?.length > 1) return <Navigate to="/choose-role" replace />;
    }

    // Homepage gets Navbar + full-width layout
    if (isHomePath) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Navbar />
                <Outlet />
            </div>
        );
    }

    // Auth pages (login, signup, etc.) → centered layout
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <Outlet />
        </div>
    );
};
export { PublicLayout };
export default PublicLayout;
