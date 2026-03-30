import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import {
  Menu, X, LogOut, Leaf, Shield,
  LayoutDashboard, CalendarPlus, Calendar, MessageSquare, User,
  CalendarCheck, ListOrdered, Stethoscope, ClipboardList,
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AppContext';

const navLinks = {
  patient: [
    { path: '/patient/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
    { path: '/patient/appointments',     label: 'My Appointments',  icon: Calendar },
    { path: '/patient/chatbot',          label: 'AI Chatbot',       icon: MessageSquare },
    { path: '/patient/profile',          label: 'Profile',          icon: User },
  ],
  doctor: [
    { path: '/doctor/dashboard',    label: 'Dashboard',              icon: LayoutDashboard },
    { path: '/doctor/today',        label: "Today's Appointments",   icon: CalendarCheck },
    { path: '/doctor/appointments', label: 'All Appointments',       icon: Calendar },
    { path: '/doctor/profile',      label: 'Profile',                icon: User },
  ],
  admin: [
    { path: '/admin/dashboard',       label: 'Dashboard',           icon: LayoutDashboard },
    { path: '/admin/queues',          label: 'Appointment Queues',  icon: ListOrdered },
    { path: '/admin/doctors',         label: 'Manage Doctors',      icon: Stethoscope },
    { path: '/admin/doctor-applications', label: 'Doctor Applications', icon: ClipboardList },
    { path: '/admin/offline-booking', label: 'Offline Booking',     icon: CalendarPlus },
  ],
};

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { roles, activeRole, handleLogout, logoutLoading } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const currentRole = activeRole || (roles?.length === 1 ? roles[0] : null);
  const links = currentRole ? (navLinks[currentRole] || []) : [];

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-2.5 border-b border-neutral-100">
        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
          <Leaf className="w-4.5 h-4.5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary-600 tracking-tight">AyurAyush</h1>
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">
            {currentRole || 'Portal'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map(link => {
          const isActive = location.pathname === link.path ||
            location.pathname.startsWith(`${link.path}/`);
          return (
            <NavLink
              key={link.path}
              to={link.path}
              aria-current={isActive ? 'page' : undefined}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                }
              `}
            >
              <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
              <span className="flex-1">{link.label}</span>
            </NavLink>
          );
        })}

        {/* Switch role link — only if user has multiple roles */}
        {roles?.length > 1 && (
          <NavLink
            to="/choose-role"
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${location.pathname === '/choose-role'
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
              }
            `}
          >
            <Shield className={`w-[18px] h-[18px] flex-shrink-0 ${location.pathname === '/choose-role' ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
            <span className="flex-1">Switch Role</span>
          </NavLink>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-neutral-100">
        <button
          onClick={onLogout}
          disabled={logoutLoading}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {logoutLoading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-md border border-neutral-100"
        aria-label="Open menu"
        aria-expanded={mobileOpen}
      >
        <Menu className="w-5 h-5 text-neutral-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-xl
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-100 flex-col z-40">
        <NavContent />
      </aside>
    </>
  );
};
export { Sidebar };
export default Sidebar;
