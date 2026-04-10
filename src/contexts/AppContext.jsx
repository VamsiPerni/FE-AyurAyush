import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../axios/axiosInstance";
import { showErrorToast, showSuccessToast } from "../utils/toastMessageHelper";

const AuthContext = createContext();
const ACTIVE_ROLE_STORAGE_KEY = "ayurayush_active_role";

const AppProvider = ({ children }) => {
    const [user, setUser] = useState({
        isLoggedIn: false,
        name: "",
        roles: [],
        activeRole: null,
        mustChangePassword: false,
        loading: true,
    });

    const [logoutLoading, setLogoutLoading] = useState(false);

    const checkAuth = async () => {
        try {
            const response = await axiosInstance.get("/auth/me");

            const name = response.data.data.name || "";
            const roles = response.data.data.roles;
            const storedActiveRole = localStorage.getItem(
                ACTIVE_ROLE_STORAGE_KEY,
            );
            const resolvedActiveRole =
                roles.length === 1
                    ? roles[0]
                    : roles.includes(storedActiveRole)
                      ? storedActiveRole
                      : null;
            const mustChangePassword =
                response.data.data.mustChangePassword || false;
            setUser({
                isLoggedIn: true,
                name,
                roles,
                activeRole: resolvedActiveRole,
                mustChangePassword,
                loading: false,
            });

            if (resolvedActiveRole) {
                localStorage.setItem(
                    ACTIVE_ROLE_STORAGE_KEY,
                    resolvedActiveRole,
                );
            } else {
                localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
            }
        } catch (err) {
            setUser({
                isLoggedIn: false,
                name: "",
                roles: [],
                activeRole: null,
                mustChangePassword: false,
                loading: false,
            });
            localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);

            console.log("------🔴Erorr in CheckAuth-----", err.message);
        }
    };

    const handleSetUser = (data) => {
        setUser((prev) => ({
            ...prev,
            ...data,
            loading: false,
        }));
    };

    const setActiveRole = (role) => {
        setUser((prev) => {
            if (!role || !prev.roles?.includes(role)) {
                return prev;
            }
            return { ...prev, activeRole: role };
        });
        if (role) {
            localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
        }
    };

    const handleLogout = async () => {
        try {
            setLogoutLoading(true);

            await axiosInstance.get("/auth/logout");

            showSuccessToast("Logout successful!");

            setUser({
                isLoggedIn: false,
                name: "",
                roles: [],
                activeRole: null,
                mustChangePassword: false,
                loading: false,
            });
            localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Logout failed");
        } finally {
            setLogoutLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...user,
                handleSetUser,
                setActiveRole,
                handleLogout,
                logoutLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuthContext = () => useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { AppProvider, useAuthContext };
