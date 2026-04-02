import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock, User } from 'lucide-react';

const AppointmentRow = ({ appointment, onView }) => {
  const { _id, appointmentId, patient, patientName, timeSlot, status, urgencyLevel } = appointment;
  const id = _id || appointmentId;
  const name = patient?.name || patientName || 'Patient';
  const isEmergency = urgencyLevel === 'emergency';

  return (
    <div className={`
      p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 
      border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors
      ${isEmergency ? 'bg-red-50/20' : ''}
    `}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isEmergency ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-800 tracking-tight">{name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeSlot}</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Badges */}
        <div className="flex sm:hidden items-center gap-2 ml-[52px]">
          {isEmergency && <Badge type="status" value="emergency">Emergency</Badge>}
          <Badge type="status" value={status} />
        </div>
      </div>
      
      <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end mt-2 sm:mt-0">
        <div className="hidden sm:flex items-center gap-2">
          {isEmergency && <Badge type="status" value="emergency">Emergency</Badge>}
          <Badge type="status" value={status} />
        </div>
        <Button size="sm" variant="secondary" onClick={() => onView?.(id)}>
          View Details
        </Button>
      </div>
    </div>
  );
};

export { AppointmentRow };
export default AppointmentRow;
