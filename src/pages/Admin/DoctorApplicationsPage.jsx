import { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, Mail, Phone, RefreshCw, AlertCircle, Award, 
  Briefcase, Banknote, CheckCircle, XCircle 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const filterCategories = [
  { id: 'all', label: 'All Applications' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const DoctorApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('pending'); // Default to pending queue
  
  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getDoctorApplications();
      setApplications(result.data?.applications || result.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to sync doctor application registry.';
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you certain you want to officially approve this practitioner into the system?')) return;
    try {
      setIsProcessing(true);
      await adminService.approveDoctorApplication(id);
      showSuccessToast('Doctor application approved successfully.');
      loadApplications();
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to approve application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      showErrorToast('A formalized rejection reason is highly critical for compliance.');
      return;
    }
    
    try {
      setIsProcessing(true);
      await adminService.rejectDoctorApplication(rejectingId, rejectReason);
      showSuccessToast('Application dynamically rejected and candidate notified.');
      setRejectModalOpen(false);
      loadApplications();
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to reject applicant securely.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const status = (app.status || 'pending').toLowerCase();
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return status === 'pending';
      if (activeTab === 'approved') return status === 'approved';
      if (activeTab === 'rejected') return status === 'rejected';
      return true;
    });
  }, [applications, activeTab]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(a => (a.status || 'pending') === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  }, [applications]);

  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    return nameStr.charAt(0).toUpperCase();
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <PageHeader title="Doctor Applications" subtitle="Reviewing prospective clinical candidate records..." />
        <div className="flex gap-2">
           <div className="w-24 h-8 bg-neutral-200 dark:bg-dark-elevated rounded-full animate-pulse" />
           <div className="w-24 h-8 bg-neutral-200 dark:bg-dark-elevated rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
           <CardSkeleton />
           <CardSkeleton />
           <CardSkeleton />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && applications.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="Registry Synchronization Error"
          description={error}
          action={<Button icon={RefreshCw} onClick={loadApplications}>Retry Fetch</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Doctor Applications"
        subtitle={`System tracking ${counts.all} total onboarding record${counts.all !== 1 ? 's' : ''}`}
        action={
          <Button variant="outline" icon={RefreshCw} onClick={loadApplications}>
            Refresh Sync
          </Button>
        }
      />

      {/* Control Navigation Filters Layout */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {filterCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border
              ${activeTab === cat.id 
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                : 'bg-white dark:bg-dark-card text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-hover hover:text-neutral-900 dark:hover:text-neutral-100'
              }
            `}
          >
            {cat.label}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold shrink-0
              ${activeTab === cat.id 
                ? 'bg-primary-500/30 text-white' 
                : 'bg-neutral-100 dark:bg-dark-elevated text-neutral-500 dark:text-neutral-400'
              }
            `}>
              {counts[cat.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Execution block (Card grid - Explicitly avoid Tables per spec) */}
      {filteredApplications.length === 0 ? (
         <div className="py-24 bg-neutral-50 dark:bg-dark-elevated rounded-2xl border border-neutral-100 dark:border-dark-border mt-6 text-center">
            <div className="w-16 h-16 bg-neutral-200/50 dark:bg-dark-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">No {activeTab !== 'all' ? activeTab : ''} applications active</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">There are no onboarding profiles matching the selected filter logic parameters currently.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredApplications.map(app => {
               const id = app._id || app.applicationId || app.id;
               const status = (app.status || 'pending').toLowerCase();
               const isPending = status === 'pending';
               
               return (
                 <Card key={id} className="overflow-hidden flex flex-col shadow-sm border border-neutral-200 dark:border-dark-border hover:shadow-md transition-shadow group">
                   
                   {/* Personal Info Header */}
                   <div className="bg-primary-50/40 dark:bg-primary-900/10 p-5 border-b border-primary-100/50 dark:border-dark-border relative">
                     <div className="absolute top-4 right-4">
                       <Badge type="status" value={status} />
                     </div>
                     <div className="flex flex-col items-center text-center mt-2">
                       <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-bold text-xl flex items-center justify-center border-4 border-white dark:border-dark-card shadow-sm ring-1 ring-primary-50 dark:ring-primary-800/30">
                          {getInitials(app.name)}
                       </div>
                       <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-3 tracking-tight">Dr. {app.name || 'Unknown'}</h3>
                       <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">{app.specialization || 'General Practitioner'}</p>
                     </div>
                   </div>

                   {/* Core Clinical Parameters */}
                   <CardContent className="p-5 flex-1 flex flex-col text-sm text-neutral-600 dark:text-neutral-400 gap-y-4">
                      
                      <div className="space-y-2 pb-4 border-b border-neutral-100 dark:border-dark-border">
                         <div className="flex items-center gap-2">
                           <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                           <span className="truncate">{app.email || 'No email provided'}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                           <span>{app.phone || app.phoneNumber || 'No phone provided'}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pb-2 border-b border-neutral-100">
                         <div>
                           <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 mt-1">
                             <Briefcase className="w-3.5 h-3.5" /> Experience
                           </div>
                           <p className="font-semibold text-neutral-800 dark:text-neutral-200">{app.experience ? `${app.experience} Years` : 'Not Set'}</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 mt-1">
                             <Banknote className="w-3.5 h-3.5" /> Est. Fee
                           </div>
                           <p className="font-semibold text-success-700">{app.consultationFee ? `₹${app.consultationFee}` : 'Free'}</p>
                         </div>
                      </div>

                      <div className="pt-2">
                         <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                           <Award className="w-3.5 h-3.5" /> Qualifications
                         </div>
                         <p className="text-neutral-800 dark:text-neutral-200 font-medium line-clamp-2">{app.qualification || app.qualifications || 'No qualifications listed.'}</p>
                      </div>

                   </CardContent>

                   {/* Action Footer Binding */}
                   {isPending ? (
                     <div className="p-4 bg-neutral-50 dark:bg-dark-elevated border-t border-neutral-100 dark:border-dark-border flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          icon={XCircle} 
                          onClick={() => openRejectModal(id)} 
                          className="flex-1 bg-white text-neutral-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
                          disabled={isProcessing}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="success" 
                          icon={CheckCircle} 
                          onClick={() => handleApprove(id)} 
                          className="flex-1"
                          disabled={isProcessing}
                        >
                          Approve
                        </Button>
                     </div>
                   ) : (
                     <div className="px-4 py-3 bg-neutral-50 dark:bg-dark-elevated border-t border-neutral-100 dark:border-dark-border text-center">
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                           Processed Application
                        </p>
                     </div>
                   )}
                 </Card>
               )
            })}
         </div>
      )}

      {/* Secure Reason Validation Modal Layout */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => !isProcessing && setRejectModalOpen(false)}
        title="Reject Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Please provide a specific clinical or administrative reason for this application denial. The physician will be notified immediately.
          </p>
          <Textarea 
            placeholder="E.g., Missing valid clinical certification records, Specialization quota completed..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={isProcessing}
            required
            rows={4}
          />
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-dark-border mt-6 pb-1">
            <Button 
              variant="outline" 
              onClick={() => setRejectModalOpen(false)} 
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleRejectSubmit} 
              loading={isProcessing}
              className="flex-1"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export { DoctorApplicationsPage };
export default DoctorApplicationsPage;
