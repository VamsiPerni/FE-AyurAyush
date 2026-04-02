import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/AppContext";
import { authService } from "../services/authService";
import { otpService } from "../services/otpService";
import { showErrorToast, showSuccessToast } from "../utils/toastMessageHelper";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const { handleSetUser } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            setLoading(true);

            const result = await authService.login(email, password);
            showSuccessToast("Login successful!");

            const roles = result.data.roles;
            const mustChangePassword = result.data.mustChangePassword || false;
            handleSetUser({ isLoggedIn: true, roles, mustChangePassword });

            if (mustChangePassword) {
                navigate("/change-password");
            } else if (roles.length === 1) {
                navigate(`/${roles[0]}/dashboard`);
            } else {
                navigate("/choose-role");
            }

            return result;
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (email) => {
        try {
            setOtpLoading(true);
            const checkResult = await authService.checkEmail(email);

            if (checkResult.exists) {
                showErrorToast("User already exists! Please login.");
                return false;
            }

            await otpService.sendOtp(email);
            showSuccessToast("OTP sent to your email!");

            return true;
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to send OTP");
            return false;
        } finally {
            setOtpLoading(false);
        }
    };

    const signup = async (data) => {
        try {
            setLoading(true);

            const result = await authService.signup(data);
            showSuccessToast("Signup successful! Please login.");

            navigate("/login");

            return result;
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Signup failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            await authService.logout();
            showSuccessToast("Logout successful!");

            handleSetUser({ isLoggedIn: false, roles: [] });

            navigate("/login");
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Logout failed");
        } finally {
            setLoading(false);
        }
    };

    return { login, signup, sendOtp, logout, loading, otpLoading };
};
