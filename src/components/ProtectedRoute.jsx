import { Navigate } from "react-router";
import { useAuthContext } from "../contexts/AppContext";

const ProtectedRoute = ({
    children,
    allowedRoles,
    allowMustChangePasswordBypass = false,
}) => {
    const { isLoggedIn, roles, mustChangePassword } = useAuthContext();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (mustChangePassword && !allowMustChangePasswordBypass) {
        return <Navigate to="/change-password" replace />;
    }

    if (allowedRoles?.length) {
        // "admin" role also satisfies "sub_admin" routes and vice-versa is NOT true
        // super-admin (admin) can access sub-admin routes too
        const hasAccess = allowedRoles.some((role) => {
            if (roles.includes(role)) return true;
            // super-admin can access anything sub_admin can
            if (role === "sub_admin" && roles.includes("admin")) return true;
            return false;
        });

        if (!hasAccess) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export { ProtectedRoute };
