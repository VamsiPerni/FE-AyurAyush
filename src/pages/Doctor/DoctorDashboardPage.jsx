import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  CalendarCheck, Clock, CheckCircle, Users, 
  RefreshCw, ClipboardList, AlertCircle, FileText
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { useAuthContext } from '../../contexts/AppContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatsSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { AppointmentRow } from '../../components/doctor/AppointmentRow';
import { showErrorToast } from '../../utils/toastMessageHelper';

const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const { name } = useAuthContext();
  const doctorName = name || 'Doctor';

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await doctorService.getDashboard();
      setDashboard(result.data?.data || result.data || {});
    } catch (err) {
      const message = 'Unable to load doctor dashboard. Please try again.';
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
        <PageHeader title={`Welcome back, Dr. ${doctorName}`} subtitle="Manage your appointments and patient care" />
        <StatsSkeleton count={4} />
        <Card className="p-6">
          <TableSkeleton rows={4} columns={3} />
        </Card>
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
          action={<Button icon={RefreshCw} onClick={loadDashboard}>Try Again</Button>}
        />
      </div>
    );
  }

  // 3. Data Extraction
  const stats = dashboard?.stats || {};
  const todayAppointments = dashboard?.todayAppointments || [];

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={`Welcome back, Dr. ${doctorName}`}
        subtitle="Track schedules, appointments, and patient workload"
        action={
          <Button icon={CalendarCheck} onClick={() => navigate('/doctor/today')}>
            Today's Schedule
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={stats.todayAppointments ?? stats.today ?? 0}
          icon={CalendarCheck}
          variant="default"
        />
        <StatCard
          label="Pending"
          value={stats.pendingAppointments ?? stats.pending ?? 0}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          label="Completed Today"
          value={stats.completedAppointments ?? stats.completed ?? 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label="Total Patients"
          value={stats.totalPatients ?? stats.patients ?? 0}
          icon={Users}
          variant="info"
        />
      </div>

      {/* Today's Appointments Grid */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <CardTitle>Today's Appointments</CardTitle>
          </div>
          {todayAppointments.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/today')}>
              View Full Schedule
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {todayAppointments.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                icon={FileText} 
                title="No appointments today" 
                description="Your schedule is clear for today. Take a break!" 
                action={<Button variant="outline" onClick={loadDashboard}>Refresh Flow</Button>}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              {todayAppointments.slice(0, 5).map((apt) => (
                <AppointmentRow
                  key={apt._id || apt.appointmentId}
                  appointment={apt}
                  onView={(id) => navigate(`/doctor/appointments/${id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
};

export { DoctorDashboardPage };
export default DoctorDashboardPage;
