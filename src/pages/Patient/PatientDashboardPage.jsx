import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Calendar, CalendarCheck, CheckCircle, XCircle, 
  CalendarPlus, MessageSquare, AlertCircle, FileText
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AppContext';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatsSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { AppointmentCard } from '../../components/patient/AppointmentCard';
import { showErrorToast } from '../../utils/toastMessageHelper';

const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const { name } = useAuthContext();
  const patientName = name || 'Patient';

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await patientService.getDashboard();
      setDashboard(result.data?.data || result.data || {});
    } catch (err) {
      const message = 'Unable to load dashboard. Please try again.';
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title={`Welcome back, ${patientName}`} subtitle="Manage your appointments and health journey" />
        <StatsSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="lg:col-span-2" />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load dashboard"
          description={error}
          action={<Button onClick={loadDashboard}>Try Again</Button>}
        />
      </div>
    );
  }

  // 3. Data Extraction
  const stats = dashboard?.stats || {};
  const recentAppointments = dashboard?.recentAppointments || [];

  // Quick action buttons snippet
  const headerActions = (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
      <Button 
        variant="secondary" 
        icon={MessageSquare} 
        onClick={() => navigate('/patient/chatbot')}
      >
        AI Chatbot
      </Button>
      <Button 
        icon={CalendarPlus} 
        onClick={() => navigate('/patient/book-appointment')}
      >
        Book Appointment
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <PageHeader 
        title={`Welcome back, ${patientName}`} 
        subtitle="Manage your appointments and health journey with AyurAyush"
        action={headerActions}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Appointments"
          value={stats.totalAppointments || stats.total || 0}
          icon={Calendar}
          variant="default"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcomingAppointments || stats.upcoming || 0}
          icon={CalendarCheck}
          variant="info"
        />
        <StatCard
          label="Completed"
          value={stats.completedAppointments || stats.completed || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelledAppointments || stats.cancelled || 0}
          icon={XCircle}
          variant="error"
        />
      </div>

      {/* Recent Appointments Section */}
      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-lg font-bold text-neutral-800 tracking-tight">Recent Appointments</h2>
        {recentAppointments.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>
            View All
          </Button>
        )}
      </div>

      {recentAppointments.length === 0 ? (
        <Card className="border-dashed border-2 bg-neutral-50/50">
          <EmptyState
            icon={FileText}
            title="No appointments yet"
            description="Book your first appointment to start tracking your treatment journey."
            action={<Button icon={CalendarPlus} onClick={() => navigate('/patient/book-appointment')}>Book Appointment</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentAppointments.slice(0, 3).map(apt => (
            <AppointmentCard 
              key={apt._id || apt.appointmentId} 
              appointment={apt} 
              onView={() => navigate(`/patient/appointments/${apt._id || apt.appointmentId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { PatientDashboardPage };
export default PatientDashboardPage;
