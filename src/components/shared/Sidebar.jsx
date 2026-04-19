import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import {
    Menu,
    X,
    LogOut,
    Leaf,
    Shield,
    LayoutDashboard,
    CalendarPlus,
    Calendar,
    Clock,
    MessageSquare,
    User,
    CalendarCheck,
    ListOrdered,
    Stethoscope,
    ClipboardList,
    BookOpen,
    IndianRupee,
    UserCog,
    ShieldCheck,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AppContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotificationBell } from "./NotificationBell";

const navLinks = {
    patient: [
        {
            path: "/patient/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            path: "/patient/book-appointment",
            label: "Book Appointment",
            icon: CalendarPlus,
        },
        {
            path: "/patient/appointments",
            label: "My Appointments",
            icon: Calendar,
        },
        { path: "/patient/chatbot", label: "AI Chatbot", icon: MessageSquare },
        { path: "/patient/profile", label: "Profile", icon: User },
    ],
    doctor: [
        {
            path: "/doctor/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            path: "/doctor/today",
            label: "Today's Appointments",
            icon: CalendarCheck,
        },
        {
            path: "/doctor/appointments",
            label: "All Appointments",
            icon: Calendar,
        },
        {
            path: "/doctor/reference",
            label: "Clinical Reference",
            icon: BookOpen,
        },
        {
            path: "/doctor/availability",
            label: "Manage Availability",
            icon: Clock,
        },
        { path: "/doctor/profile", label: "Profile", icon: User },
    ],
    admin: [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
            path: "/admin/queues",
            label: "Appointment Queues",
            icon: ListOrdered,
            subLinks: [
                { path: "/admin/queues/live", label: "Live Queue" },
                {
                    path: "/admin/queues/emergency",
                    label: "Emergency Priority",
                },
                { path: "/admin/queues/standard", label: "Standard Check-ins" },
            ],
        },
        { path: "/admin/doctors", label: "Manage Doctors", icon: Stethoscope },
        {
            path: "/admin/doctor-applications",
            label: "Doctor Applications",
            icon: ClipboardList,
        },
        {
            path: "/admin/offline-booking",
            label: "Offline Booking",
            icon: CalendarPlus,
        },
        {
            path: "/admin/revenue",
            label: "Revenue & Payments",
            icon: IndianRupee,
        },
    ],
};

const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { roles, activeRole, handleLogout, logoutLoading, subAdminProfile } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();

    const isSuperAdmin = roles?.includes("admin");
    const isSubAdmin = roles?.includes("sub_admin");
    const currentRole = activeRole || (roles?.length === 1 ? roles[0] : null);

    // Build dynamic sub-admin nav based on permissions
    const buildSubAdminLinks = () => {
        const perms = subAdminProfile?.permissions || {};
        const links = [
            { path: "/sub-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ];
        if (perms.viewQueues || perms.viewEmergencyQueue || perms.viewOverdue || perms.viewPastAppointments) {
            links.push({
                path: "/admin/queues",
                label: "Appointment Queues",
                icon: ListOrdered,
                subLinks: [
                    { path: "/admin/queues/live", label: "Live Queue" },
                    { path: "/admin/queues/emergency", label: "Emergency Priority" },
                    { path: "/admin/queues/standard", label: "Standard Check-ins" },
                ],
            });
        }
        if (perms.viewDoctors || perms.manageAvailability) {
            links.push({ path: "/admin/doctors", label: "Doctors", icon: Stethoscope });
        }
        if (perms.viewDoctorApplications) {
            links.push({ path: "/admin/doctor-applications", label: "Doctor Applications", icon: ClipboardList });
        }
        if (perms.offlineBooking) {
            links.push({ path: "/admin/offline-booking", label: "Offline Booking", icon: CalendarPlus });
        }
        return links;
    };

    const superAdminLinks = [
        { path: "/super-admin/dashboard", label: "System Dashboard", icon: LayoutDashboard },
        { path: "/super-admin/sub-admins", label: "Manage Sub-Admins", icon: UserCog },
        { path: "/admin/dashboard", label: "Admin Dashboard", icon: ShieldCheck },
        {
            path: "/admin/queues",
            label: "Appointment Queues",
            icon: ListOrdered,
            subLinks: [
                { path: "/admin/queues/live", label: "Live Queue" },
                { path: "/admin/queues/emergency", label: "Emergency Priority" },
                { path: "/admin/queues/standard", label: "Standard Check-ins" },
            ],
        },
        { path: "/admin/doctors", label: "Manage Doctors", icon: Stethoscope },
        { path: "/admin/doctor-applications", label: "Doctor Applications", icon: ClipboardList },
        { path: "/admin/offline-booking", label: "Offline Booking", icon: CalendarPlus },
        { path: "/admin/revenue", label: "Revenue & Payments", icon: IndianRupee },
    ];

    const links = isSuperAdmin
        ? superAdminLinks
        : isSubAdmin
          ? buildSubAdminLinks()
          : navLinks[currentRole] || [];

    // Close on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const onLogout = async () => {
        await handleLogout();
        navigate("/login");
    };

    const NavContent = () => (
        <>
            {/* Logo */}
            <Link
                to="/"
                className="h-16 px-6 flex items-center gap-3 border-b border-neutral-100 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover transition-colors"
            >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                    <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gradient tracking-tight">
                        AyurAyush
                    </h1>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-widest">
                        {isSuperAdmin ? "Super Admin" : isSubAdmin ? "Sub Admin" : currentRole || "Portal"}
                    </p>
                </div>
            </Link>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                {links.map((link) => {
                    const isActive =
                        location.pathname === link.path ||
                        location.pathname.startsWith(`${link.path}/`);
                    return (
                        <div key={link.path} className="space-y-1">
                            <NavLink
                                to={link.path}
                                aria-current={isActive ? "page" : undefined}
                                className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${
                        isActive
                            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-dark-hover dark:hover:text-neutral-200"
                    }
                `}
                            >
                                {isActive && (
                                    <span className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />
                                )}
                                <link.icon
                                    className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"}`}
                                />
                                <span className="flex-1">{link.label}</span>
                            </NavLink>
                            {link.subLinks && isActive && (
                                <div className="pl-10 space-y-1 border-l-2 border-neutral-100 dark:border-dark-border ml-4">
                                    {link.subLinks.map((subLink) => {
                                        const isSubActive =
                                            location.pathname === subLink.path;
                                        return (
                                            <NavLink
                                                key={subLink.path}
                                                to={subLink.path}
                                                className={`
                                                    block px-3 py-2 rounded-xl text-sm font-medium transition-colors
                                                    ${
                                                        isSubActive
                                                            ? "bg-neutral-100 text-primary-600 dark:bg-dark-hover dark:text-primary-400"
                                                            : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-dark-hover"
                                                    }
                                                `}
                                            >
                                                {subLink.label}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Switch role link — only if user has multiple roles */}
                {roles?.length > 1 && (
                    <NavLink
                        to="/choose-role"
                        className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${
                  location.pathname === "/choose-role"
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-dark-hover dark:hover:text-neutral-200"
              }
            `}
                    >
                        <Shield
                            className={`w-4.5 h-4.5 shrink-0 ${location.pathname === "/choose-role" ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"}`}
                        />
                        <span className="flex-1">Switch Role</span>
                    </NavLink>
                )}
            </nav>

            {/* Footer — theme toggle + notifications + logout */}
            <div className="p-3 border-t border-neutral-100 dark:border-dark-border space-y-1">
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                        Theme
                    </span>
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <ThemeToggle size="sm" />
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    disabled={logoutLoading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                >
                    <LogOut className="w-4.5 h-4.5" />
                    {logoutLoading ? "Signing out..." : "Sign out"}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-dark-card rounded-xl shadow-md border border-neutral-100 dark:border-dark-border hover:scale-105 active:scale-95 transition-all"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
            >
                <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`
        lg:hidden fixed inset-y-0 left-0 w-72 bg-white dark:bg-dark-card z-50 flex flex-col shadow-xl dark:shadow-dark-elevated
        transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-hover rounded-xl transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
                <NavContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-card border-r border-neutral-100 dark:border-dark-border flex-col z-40 transition-colors duration-300">
                <NavContent />
            </aside>
        </>
    );
};
export { Sidebar };
export default Sidebar;
