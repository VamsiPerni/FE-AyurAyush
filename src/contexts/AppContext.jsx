import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../axios/axiosInstance";
import { showErrorToast, showSuccessToast } from "../utils/toastMessageHelper";

const AuthContext = createContext();

const AppProvider = ({ children }) => {
    const [user, setUser] = useState({
        isLoggedIn: false,
        roles: [],
        activeRole: null,
        loading: true,
    });

    const [logoutLoading, setLogoutLoading] = useState(false);

    const checkAuth = async () => {
        try {
            const response = await axiosInstance.get("/auth/me");

            const roles = response.data.data.roles;
            setUser({
                isLoggedIn: true,
                roles,
                activeRole: roles.length === 1 ? roles[0] : null,
                loading: false,
            });
        } catch (err) {
            setUser({
                isLoggedIn: false,
                roles: [],
                activeRole: null,
                loading: false,
            });

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
        setUser((prev) => ({ ...prev, activeRole: role }));
    };

    const handleLogout = async () => {
        try {
            setLogoutLoading(true);

            await axiosInstance.get("/auth/logout");

            showSuccessToast("Logout successful!");

            setUser({
                isLoggedIn: false,
                roles: [],
                activeRole: null,
                loading: false,
            });
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
