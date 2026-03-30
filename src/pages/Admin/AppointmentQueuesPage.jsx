import { useState, useEffect } from 'react';
import { ShieldAlert, Users, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmergencyQueueCard } from '../../components/admin/EmergencyQueueCard';
import { NormalQueueTable } from '../../components/admin/NormalQueueTable';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const AppointmentQueuesPage = () => {
  const [emergencyQueue, setEmergencyQueue] = useState([]);
  const [normalQueue, setNormalQueue] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const loadQueues = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [emRes, normRes] = await Promise.all([
        adminService.getEmergencyAppointments(),
        adminService.getPendingAppointments()
      ]);
      
      setEmergencyQueue(emRes.data?.appointments || emRes.data || []);
      setNormalQueue(normRes.data?.appointments || normRes.data || []);
      
    } catch (err) {
      const message = 'Failed to load appointment queues. Please check connection.';
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this appointment for checkout?')) return;
    try {
      await adminService.approveAppointment(id);
      showSuccessToast('Appointment approved successfully');
      loadQueues();
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to approve appointment.');
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      showErrorToast('A rejection reason is highly critical for compliance.');
      return;
    }
    
    try {
      setIsRejecting(true);
      await adminService.rejectAppointment(rejectingId, rejectReason);
      showSuccessToast('Appointment efficiently rejected and logs updated.');
      setRejectModalOpen(false);
      loadQueues();
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to reject appointment securely.');
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-8">
        <PageHeader title="Appointment Queues" subtitle="Reviewing triage flows actively..." />
        <Card className="p-6 border-red-100 bg-red-50/10">
          <TableSkeleton rows={2} columns={3} />
        </Card>
        <Card className="p-6">
          <TableSkeleton rows={6} columns={5} />
        </Card>
      </div>
    );
  }

  if (error && emergencyQueue.length === 0 && normalQueue.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="System Connection Error"
          description={error}
          action={<Button icon={RefreshCw} onClick={loadQueues}>Retry Fetch</Button>}
        />
      </div>
    );
  }

  const queueTotal = emergencyQueue.length + normalQueue.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in">
      <PageHeader
        title="Appointment Queues"
        subtitle={`Real-time Triage: ${queueTotal} Appointments pending your review.`}
        action={
          <Button variant="outline" icon={RefreshCw} onClick={loadQueues}>
            Refresh Sync
          </Button>
        }
      />

      {/* EMERGENCY QUEUE */}
      <Card className="border-red-200 shadow-md shadow-red-100/30 overflow-hidden">
        <CardHeader className="bg-red-50/80 border-b border-red-100 flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-900 tracking-tight">Emergency Queue</CardTitle>
          </div>
          <Badge type="status" value="emergency" className="shadow-xs font-bold ring-1 ring-red-300">
            {emergencyQueue.length} Priority Un-Checked
          </Badge>
        </CardHeader>
        <CardContent className={emergencyQueue.length > 0 ? "p-4 sm:p-6 bg-red-50/10" : "p-0"}>
          {emergencyQueue.length === 0 ? (
            <div className="py-12 bg-white flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-success-50 text-success-500 rounded-full flex items-center justify-center mb-4 border border-success-100">
                 <ShieldAlert className="w-8 h-8 opacity-50" />
               </div>
               <h3 className="text-lg font-bold text-neutral-800">No active emergencies</h3>
               <p className="text-neutral-500 text-sm">Crisis triage is clear right now. Good work.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {emergencyQueue.map(apt => (
                <EmergencyQueueCard 
                  key={apt._id || apt.appointmentId} 
                  appointment={apt} 
                  onApprove={handleApprove} 
                  onReject={openRejectModal} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NORMAL QUEUE */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <CardTitle className="text-neutral-800">Standard Check-Ins</CardTitle>
          </div>
          <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-200">
            {normalQueue.length} Awaiting Approval
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {normalQueue.length === 0 ? (
            <div className="py-20">
              <EmptyState
                icon={AlertTriangle}
                title="Normal Queue Cleared"
                description="There are currently no standard appointments pending your direct review."
              />
            </div>
          ) : (
            <NormalQueueTable 
              appointments={normalQueue} 
              onApprove={handleApprove} 
              onReject={openRejectModal} 
            />
          )}
        </CardContent>
      </Card>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => !isRejecting && setRejectModalOpen(false)}
        title="Provide Rejection Reason"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Please explicitly dictate clinical or standard justification restricting the patient from progressing via verification processes naturally.
          </p>
          <Textarea 
            placeholder="E.g., Doctor is unavailable today, Invalid check-in credentials..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={isRejecting}
            required
            rows={4}
          />
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 mt-6 pb-1">
            <Button 
              variant="outline" 
              onClick={() => setRejectModalOpen(false)} 
              disabled={isRejecting}
              className="flex-1"
            >
              Cancel Edit
            </Button>
            <Button 
              variant="danger" 
              onClick={handleRejectSubmit} 
              loading={isRejecting}
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

export { AppointmentQueuesPage };
export default AppointmentQueuesPage;
