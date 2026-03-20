import { Link, useLocation } from "react-router";
import { useAuthContext } from "../contexts/AppContext";
import { useState } from "react";
import {
    Stethoscope,
    Menu,
    X,
    Home,
    LogIn,
    LogOut,
    MessageSquare,
    CalendarPlus,
    ClipboardList,
    UserPlus,
    CalendarCheck,
    Calendar,
    Users,
    Shield,
    Settings,
    UserCheck,
    User,
} from "lucide-react";

const patientLinks = [
    { to: "/patient/dashboard", label: "Dashboard", icon: Home },
    { to: "/patient/chatbot", label: "AI Chat", icon: MessageSquare },
    { to: "/patient/book-appointment", label: "Book", icon: CalendarPlus },
    { to: "/patient/appointments", label: "Appointments", icon: ClipboardList },
    { to: "/patient/apply-doctor-role", label: "Apply Doctor", icon: UserPlus },
    { to: "/patient/profile", label: "Profile", icon: User },
];

const doctorLinks = [
    { to: "/doctor/dashboard", label: "Dashboard", icon: Home },
    { to: "/doctor/today", label: "Today", icon: CalendarCheck },
    { to: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { to: "/doctor/profile", label: "Profile", icon: User },
];

const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: Home },
    { to: "/admin/queues", label: "Queues", icon: ClipboardList },
    {
        to: "/admin/doctor-applications",
        label: "Applications",
        icon: UserCheck,
    },
    { to: "/admin/doctors", label: "Doctors", icon: Users },
    { to: "/admin/offline-booking", label: "Walk-in", icon: CalendarPlus },
];

const roleLinksMap = {
    patient: patientLinks,
    doctor: doctorLinks,
    admin: adminLinks,
};
const roleColors = { patient: "#02C39A", doctor: "#065A82", admin: "#7C3AED" };

const Navbar = () => {
    const { isLoggedIn, roles, activeRole, handleLogout, logoutLoading } =
        useAuthContext();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentRole = activeRole || (roles?.length === 1 ? roles[0] : null);
    const navLinks = currentRole ? roleLinksMap[currentRole] || [] : [];

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#065A82] to-[#02C39A] rounded-lg flex items-center justify-center">
                            <Stethoscope size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                            AyurAyush
                        </span>
                        {currentRole && (
                            <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${roleColors[currentRole]}15`,
                                    color: roleColors[currentRole],
                                }}
                            >
                                {currentRole}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {isLoggedIn &&
                            navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        isActive(link.to)
                                            ? "bg-[#065A82]/10 text-[#065A82]"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    <link.icon size={14} />
                                    {link.label}
                                </Link>
                            ))}

                        {/* Role switcher for multi-role users */}
                        {isLoggedIn && roles?.length > 1 && (
                            <Link
                                to="/choose-role"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                            >
                                <Shield size={14} />
                                Switch Role
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            >
                                {logoutLoading ? (
                                    <span className="animate-spin h-3.5 w-3.5 border-2 border-red-600 border-t-transparent rounded-full" />
                                ) : (
                                    <LogOut size={14} />
                                )}
                                {logoutLoading ? "Logging out..." : "Logout"}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-[#065A82] text-white text-sm font-medium rounded-lg hover:bg-[#065A82]/90 transition"
                            >
                                <LogIn size={14} />
                                Sign In
                            </Link>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            to="/"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Home size={16} /> Home
                        </Link>

                        {isLoggedIn &&
                            navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                        isActive(link.to)
                                            ? "bg-[#065A82]/10 text-[#065A82] font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    <link.icon size={16} /> {link.label}
                                </Link>
                            ))}

                        {isLoggedIn && roles?.length > 1 && (
                            <Link
                                to="/choose-role"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Shield size={16} /> Switch Role
                            </Link>
                        )}

                        <div className="border-t border-gray-100 pt-2 mt-2">
                            {isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileOpen(false);
                                    }}
                                    disabled={logoutLoading}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full"
                                >
                                    <LogOut size={16} />{" "}
                                    {logoutLoading
                                        ? "Logging out..."
                                        : "Logout"}
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#065A82] font-medium hover:bg-[#065A82]/5"
                                >
                                    <LogIn size={16} /> Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export { Navbar };
