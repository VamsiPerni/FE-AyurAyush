import { Navigate, Outlet, useLocation } from 'react-router';
import { Sidebar } from '../components/shared/Sidebar';
import { PageLoader } from '../components/ui/Spinner';
import { useAuthContext } from '../contexts/AppContext';

const PrivateLayout = () => {
  const { isLoggedIn, loading, activeRole, mustChangePassword, roles } = useAuthContext();
  const location = useLocation();

  // Show loader while checking auth via GET /auth/me
  if (loading) return <PageLoader message="Verifying session..." />;

  // Not authenticated → redirect to login
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;

  // Must change password → redirect (unless already on that page)
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Needs role selection → redirect to choose-role
  const needsRoleSelection = !activeRole && roles?.length > 1;
  if (needsRoleSelection && location.pathname !== '/choose-role') {
    return <Navigate to="/choose-role" replace />;
  }

  // Choose-role and change-password pages render without sidebar
  if (location.pathname === '/choose-role' || location.pathname === '/change-password' || !activeRole) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-surface flex items-center justify-center p-4 transition-colors duration-300">
        <Outlet />
      </div>
    );
  }

  // Main layout with sidebar
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-surface transition-colors duration-300">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export { PrivateLayout };
export default PrivateLayout;
