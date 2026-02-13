import { useState } from "react";
import { PuffLoader } from "react-spinners";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import { Link, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { axiosInstance } from "../../axios/axiosInstance";

const LoginPage = () => {
    const [loggingInUser, setLoggingInUser] = useState(false);
    const { handleSetUser } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoggingInUser(true);

            const email = e.target.email.value;
            const password = e.target.password.value;

            const response = await axiosInstance.post("/auth/login", {
                email,
                password,
            });

            const result = await response.data;

            if (response.status === 200) {
                showSuccessToast("Login Success!");

                const roles = result.data.roles;

                handleSetUser({
                    isLoggedIn: true,
                    roles,
                });

                if (roles.length === 1) {
                    navigate(`/${roles[0]}/dashboard`);
                } else {
                    navigate("/choose-role");
                }
            } else {
                showErrorToast(result.message);
            }
        } catch (err) {
            showErrorToast(`Unable to login: ${err.message}`);
        } finally {
            setLoggingInUser(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 items-center justify-center p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="border border-amber-700 px-2 py-1 rounded-md"
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        required
                        className="border border-amber-700 px-2 py-1 rounded-md"
                    />
                </div>

                {loggingInUser ? (
                    <div className="flex justify-center p-6">
                        <PuffLoader size={40} />
                    </div>
                ) : (
                    <button className="self-center bg-amber-600 px-4 py-1 rounded-md text-white hover:bg-amber-700 transition">
                        Login
                    </button>
                )}
            </form>

            <Link to="/signup" className="underline text-blue-600">
                Don't have an account? Signup here
            </Link>
        </div>
    );
};

export { LoginPage };
