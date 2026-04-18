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
                admin: "/super-admin/dashboard",
                sub_admin: "/sub-admin/dashboard",
            };
            const from = location.state?.from?.pathname;
            const fallbackRoute = routes[activeRole] || "/choose-role";
            return <Navigate to={from || fallbackRoute} replace />;
        }

        if (roles?.length > 1) return <Navigate to="/choose-role" replace />;
    }

    // Homepage gets Navbar + full-width layout
    if (isHomePath) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-dark-surface transition-colors duration-300">
                <Navbar />
                <Outlet />
            </div>
        );
    }

    // Auth pages (login, signup, etc.) → centered layout with decorative bg
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-dark-surface flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
            {/* Decorative background orbs */}
            <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl pointer-events-none" />
            <Outlet />
        </div>
    );
};
export { PublicLayout };
export default PublicLayout;
