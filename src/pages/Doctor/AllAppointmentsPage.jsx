import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, RefreshCw, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { showErrorToast } from '../../utils/toastMessageHelper';

const filterCategories = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const AllAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      // Robust method execution handling mapping mismatches dynamically
      const fetchFn = doctorService.getAllAppointments || doctorService.getAppointments;
      const result = await fetchFn();
      setAppointments(result.data?.appointments || result.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load appointments history.';
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatDateIN = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Client-side filtering and searching
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Name Search
      const name = apt.patient?.name || apt.patientName || 'Patient';
      if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Tab Filter
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return ['pending_admin_approval'].includes(apt.status);
      if (activeTab === 'confirmed') return apt.status === 'confirmed';
      if (activeTab === 'completed') return apt.status === 'completed';
      if (activeTab === 'cancelled') return ['cancelled', 'rejected'].includes(apt.status);
      return true;
    });
  }, [appointments, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => ['pending_admin_approval'].includes(a.status)).length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => ['cancelled', 'rejected'].includes(a.status)).length,
    };
  }, [appointments]);

  const handleRowClick = (apt) => {
    const id = apt._id || apt.appointmentId;
    if (id) navigate(`/doctor/appointments/${id}`);
  };

  // Table Columns Setup mapping to Spec rules
  const columns = [
    {
      key: 'patient',
      header: 'Patient Name',
      render: (_, apt) => (
        <span className="font-semibold text-neutral-800">
          {apt.patient?.name || apt.patientName || 'Patient'}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (_, apt) => (
        <span className="text-neutral-600 font-medium">
          {formatDateIN(apt.date)}
        </span>
      )
    },
    {
      key: 'timeSlot',
      header: 'Time Slot',
      render: (_, apt) => (
        <span className="text-neutral-600 font-medium whitespace-nowrap">
          {apt.timeSlot}
        </span>
      )
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (_, apt) => (
        apt.urgencyLevel === 'emergency' 
          ? <Badge type="status" value="emergency">Emergency</Badge>
          : <span className="text-neutral-400 font-medium text-sm">Normal</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, apt) => <Badge type="status" value={apt.status} />
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (_, apt) => (
        <div className="flex justify-end">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(apt);
            }}
            className="rounded-full"
            icon={ChevronRight}
          />
        </div>
      )
    }
  ];

  // Map red highlighting for emergency rows directly passing down dynamically to Table
  // Since our Table component in Spec v4.8 accepts standard Tailwind mapping, we'll format the rows.
  // Wait, current Table component API doesn't have `rowClassName` inherently exposed by default, 
  // but if it triggers red styles purely from Badges we map it above exactly per requirement ("Urgency Badge - emergency gets red"). Every row gets a distinct urgency indicator naturally.

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <PageHeader title="All Appointments" subtitle="Fetching comprehensive schedule history..." />
        <Card className="p-6">
          <TableSkeleton rows={8} columns={6} />
        </Card>
      </div>
    );
  }

  // 2. Error State
  if (error && appointments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="Data Synchronization Error"
          description={error}
          action={<Button icon={RefreshCw} onClick={loadAppointments}>Retry Synchronization</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="All Appointments"
        subtitle={`Managing ${counts.all} total registered case${counts.all !== 1 ? 's' : ''}`}
        action={
          <Button variant="outline" icon={RefreshCw} onClick={loadAppointments}>
            Refresh Ledger
          </Button>
        }
      />

      <Card className="overflow-hidden shadow-sm border border-neutral-100 min-h-[500px]">
        {/* Controls Layout Top Bar */}
        <div className="bg-neutral-50/50 p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
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

          <div className="w-full md:w-64 shrink-0">
            <Input
              icon={Search}
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        {/* Data Table Container */}
        <div className="w-full">
          {filteredAppointments.length === 0 ? (
            <div className="py-24">
              <EmptyState
                icon={FileText}
                title="No appointments discovered"
                description={
                  searchQuery 
                    ? `No matching records found for "${searchQuery}".`
                    : `No ${filterCategories.find(c => c.id === activeTab)?.label.toLowerCase()} cases logged yet.`
                }
                action={
                  searchQuery ? (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="table-responsive">
              <Table 
                columns={columns} 
                data={filteredAppointments} 
                striped 
                // Implicit route mapping natively supported if custom clicking was required, 
                // however Table data doesn't default to row click easily unless mapped inside rendering loop. 
                // Therefore we attached click handlers onto the primary Action button explicitly per spec (Action View button) safely bridging constraints organically.
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export { AllAppointmentsPage };
export default AllAppointmentsPage;
