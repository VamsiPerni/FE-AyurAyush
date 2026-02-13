import { Navigate } from "react-router";
import { useAuthContext } from "../contexts/AppContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, roles } = useAuthContext();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
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
