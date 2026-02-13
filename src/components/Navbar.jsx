import { Link } from "react-router";
import { useAuthContext } from "../contexts/AppContext";

const Navbar = () => {
    const { isLoggedIn, roles, handleLogout, logoutLoading } = useAuthContext();

    return (
        <div className="flex px-6 py-4 bg-amber-200 justify-between items-center">
            <div className="text-xl font-bold text-purple-800">AyurAyush</div>

            <div className="flex gap-4 items-center">
                <Link to="/" className="underline text-blue-700">
                    Home
                </Link>

                {isLoggedIn ? (
                    <>
                        {roles.includes("patient") && (
                            <Link to="/patient/dashboard" className="underline">
                                Patient
                            </Link>
                        )}

                        {roles.includes("doctor") && (
                            <Link to="/doctor/dashboard" className="underline">
                                Doctor
                            </Link>
                        )}

                        {roles.includes("admin") && (
                            <Link to="/admin/dashboard" className="underline">
                                Admin
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            disabled={logoutLoading}
                            className="px-3 py-1 bg-red-500 text-white rounded-md flex items-center gap-2 disabled:opacity-60"
                        >
                            {logoutLoading ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Logging out...
                                </>
                            ) : (
                                "Logout"
                            )}
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="underline text-blue-700">
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export { Navbar };
