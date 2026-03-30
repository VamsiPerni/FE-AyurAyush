import { Button } from '../ui/Button';
import { Clock, Calendar, ShieldAlert, Check, X } from 'lucide-react';

const EmergencyQueueCard = ({ appointment, onApprove, onReject }) => {
  const { _id, appointmentId, patient, patientName, doctor, doctorName, date, timeSlot } = appointment;
  const id = _id || appointmentId;
  
  const formatDateIN = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      {/* Red priority left border accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 ring-4 ring-red-50">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-red-900 text-lg tracking-tight">{patient?.name || patientName || 'Unknown Patient'}</h4>
          <p className="text-sm font-semibold text-red-700/80 mt-0.5">Assigned to: Dr. {doctor?.name || doctorName || 'Unassigned'}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs font-semibold uppercase tracking-wider text-red-800/70">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDateIN(date)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {timeSlot}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-red-200/50 justify-end">
        <Button 
          variant="outline" 
          icon={X} 
          onClick={() => onReject(id)} 
          className="bg-transparent border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 w-full sm:w-auto"
        >
          Decline
        </Button>
        <Button 
          variant="danger" 
          icon={Check} 
          onClick={() => onApprove(id)}
          className="w-full sm:w-auto"
        >
          Approve Override
        </Button>
      </div>
    </div>
  );
};

export { EmergencyQueueCard };
export default EmergencyQueueCard;
