import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { AppointmentRow } from '../../components/doctor/AppointmentRow';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { showErrorToast } from '../../utils/toastMessageHelper';

const filterCategories = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
];

const TodayAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await doctorService.getTodayAppointments();
      setAppointments(result.data?.appointments || result.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load today’s schedule.';
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatter = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const todayDateString = formatter.format(new Date());

  // Client-side filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return ['pending_admin_approval'].includes(apt.status);
      if (activeTab === 'confirmed') return apt.status === 'confirmed';
      if (activeTab === 'completed') return apt.status === 'completed';
      return true;
    });
  }, [appointments, activeTab]);

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => ['pending_admin_approval'].includes(a.status)).length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
  }, [appointments]);

  // Loading State
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        <PageHeader 
          title="Today's Appointments" 
          subtitle={`${todayDateString} • Fetching queue...`} 
        />
        <div className="flex gap-2">
          {filterCategories.map(cat => (
            <div key={cat.id} className="h-8 w-24 bg-neutral-200 rounded-full animate-pulse" />
          ))}
        </div>
        <Card className="p-6">
          <TableSkeleton rows={6} columns={4} />
        </Card>
      </div>
    );
  }

  // Error State
  if (error && appointments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Schedule"
          description={error}
          action={<Button icon={RefreshCw} onClick={loadAppointments}>Retry Fetching</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Today's Appointments"
        subtitle={`${todayDateString} • ${counts.all} Total Appointments`}
        action={
          <Button variant="outline" icon={RefreshCw} onClick={loadAppointments}>
            Refresh Sync
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filterCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeTab === cat.id 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-800'
              }
            `}
          >
            {cat.label}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${activeTab === cat.id 
                ? 'bg-primary-500/30 text-white' 
                : 'bg-neutral-100 text-neutral-500'
              }
            `}>
              {counts[cat.id]}
            </span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden min-h-[400px]">
        <CardContent className="p-0">
          {filteredAppointments.length === 0 ? (
            <div className="py-20 bg-neutral-50/50">
              <EmptyState
                icon={FileText}
                title={activeTab === 'all' ? 'No appointments today' : `No ${filterCategories.find(c => c.id === activeTab)?.label.toLowerCase()} appointments`}
                description={
                  activeTab === 'all' 
                    ? "Your schedule is currently clear for the day." 
                    : `You don't have any patients matching this status.`
                }
              />
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredAppointments.map((apt) => (
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

export { TodayAppointmentsPage };
export default TodayAppointmentsPage;
