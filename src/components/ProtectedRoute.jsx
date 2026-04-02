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
        const hasAccess = allowedRoles.some((role) => roles.includes(role));

        if (!hasAccess) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export { ProtectedRoute };
