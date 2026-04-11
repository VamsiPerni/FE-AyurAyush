import { Link, useLocation } from "react-router";
import { useAuthContext } from "../contexts/AppContext";
import { useState } from "react";
import { ThemeToggle } from "./ui/ThemeToggle";
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
    CalendarCheck,
    Calendar,
    Users,
    Shield,
    UserCheck,
    User,
    Leaf,
} from "lucide-react";

const patientLinks = [
    { to: "/patient/dashboard", label: "Dashboard", icon: Home },
    { to: "/patient/chatbot", label: "AI Chat", icon: MessageSquare },
    { to: "/patient/book-appointment", label: "Book", icon: CalendarPlus },
    { to: "/patient/appointments", label: "Appointments", icon: ClipboardList },
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
const roleBadgeStyles = {
    patient: "bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400",
    doctor: "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
    admin: "bg-warning-50 text-warning-600 dark:bg-warning-900/20 dark:text-warning-500",
};

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
        <nav className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-neutral-100 dark:border-dark-border sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                            <Leaf size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-gradient text-lg">
                            AyurAyush
                        </span>
                        {currentRole && (
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeStyles[currentRole] || roleBadgeStyles.doctor}`}
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
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive(link.to)
                                            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-dark-hover dark:hover:text-neutral-200"
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
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-dark-hover dark:hover:text-neutral-200 transition-all duration-200"
                            >
                                <Shield size={14} />
                                Switch Role
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle size="sm" />

                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                            >
                                {logoutLoading ? (
                                    <span className="animate-spin h-3.5 w-3.5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full" />
                                ) : (
                                    <LogOut size={14} />
                                )}
                                {logoutLoading ? "Logging out..." : "Logout"}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <LogIn size={14} />
                                Sign In
                            </Link>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-dark-hover transition-colors"
                        >
                            {mobileOpen ? <X size={20} className="text-neutral-700 dark:text-neutral-200" /> : <Menu size={20} className="text-neutral-700 dark:text-neutral-200" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-neutral-100 dark:border-dark-border bg-white dark:bg-dark-card animate-slide-down">
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            to="/"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-hover"
                        >
                            <Home size={16} /> Home
                        </Link>

                        {isLoggedIn &&
                            navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                                        isActive(link.to)
                                            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium"
                                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-hover"
                                    }`}
                                >
                                    <link.icon size={16} /> {link.label}
                                </Link>
                            ))}

                        {isLoggedIn && roles?.length > 1 && (
                            <Link
                                to="/choose-role"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-hover"
                            >
                                <Shield size={16} /> Switch Role
                            </Link>
                        )}

                        <div className="border-t border-neutral-100 dark:border-dark-border pt-2 mt-2">
                            {isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileOpen(false);
                                    }}
                                    disabled={logoutLoading}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full"
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
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/10"
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
