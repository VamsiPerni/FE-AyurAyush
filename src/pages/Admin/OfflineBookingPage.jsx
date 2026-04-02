import { useState, useEffect } from 'react';
import { 
  User, Phone, Calendar, Clock, Stethoscope, 
  ShieldAlert, Activity, FileText, CheckCircle2 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const OfflineBookingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    urgencyLevel: 'normal'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const result = await adminService.getDoctors();
        setDoctors(result.data?.doctors || result.data || []);
      } catch (err) {
        showErrorToast('Failed to load registered doctors. Please refresh.');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.date) {
        setAvailableSlots([]);
        return;
      }
      
      try {
        setLoadingSlots(true);
        const result = await adminService.getDoctorAvailableSlots(formData.doctorId, formData.date);
        
        // Handle array of strings or array of objects
        const slotsArray = result.data?.availableSlots || result.data?.slots || result.data || [];
        setAvailableSlots(slotsArray);
        
        // Auto-clear selected slot if it's no longer in the fetched list
        setFormData(prev => ({ ...prev, timeSlot: '' }));
      } catch (err) {
        setAvailableSlots([]);
        showErrorToast('Failed to retrieve available slots for the selected date.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.doctorId, formData.date]);

  const validateField = (field, value) => {
    switch (field) {
      case 'patientName':
        return value.trim() ? '' : 'Patient name is required';
      case 'patientPhone':
        return value.trim() ? '' : 'Contact number is required';
      case 'doctorId':
        return value ? '' : 'Please assign a doctor';
      case 'date':
        return value ? '' : 'Appointment date is required';
      case 'timeSlot':
        return value ? '' : 'A time slot must be selected';
      default:
        return '';
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const setUrgency = (level) => {
    setFormData(prev => ({ ...prev, urgencyLevel: level }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    ['patientName', 'patientPhone', 'doctorId', 'date', 'timeSlot'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await adminService.offlineBookAppointment(formData);
      showSuccessToast('Appointment booked successfully');
      
      // Reset Form payload explicitly
      setFormData({
        patientName: '',
        patientPhone: '',
        doctorId: '',
        date: '',
        timeSlot: '',
        urgencyLevel: 'normal'
      });
      setAvailableSlots([]);
      setErrors({});
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || 'Failed to submit offline booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date Constraints configurations
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDateString = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const isEmergency = formData.urgencyLevel === 'emergency';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Offline Booking"
        subtitle="Book appointments for walk-in patients manually overriding digital constraints."
      />

      <Card className={`border overflow-hidden shadow-sm transition-colors ${isEmergency ? 'border-red-300' : 'border-neutral-200'}`}>
        
        {/* Spec §15 Rule 10: Triage Warning Banner */}
        {isEmergency && (
           <div className="bg-red-50 py-3 px-6 border-b border-red-200 flex items-center justify-between text-red-800 animate-in slide-in-from-top-2">
             <div className="flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 animate-pulse" />
               <span className="font-bold tracking-tight text-sm uppercase">Emergency Protocol Activated</span>
             </div>
             <p className="text-xs font-semibold opacity-80 hidden sm:block">Patient will bypass standard queue restrictions dynamically.</p>
           </div>
        )}

        <CardContent className={`p-6 sm:p-8 ${isEmergency ? 'bg-red-50/10' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* Walk-in Identity Config */}
            <div className="space-y-6">
              <h3 className={`text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${isEmergency ? 'text-red-600/70 border-red-100' : 'text-neutral-400 border-neutral-100'}`}>
                <User className="w-4 h-4" /> Patient Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  id="walkin-name"
                  icon={User}
                  placeholder="e.g. Rahul Sharma"
                  value={formData.patientName}
                  onChange={handleChange('patientName')}
                  error={errors.patientName}
                  required
                />
                
                <Input
                  label="Contact Number"
                  id="walkin-phone"
                  type="tel"
                  icon={Phone}
                  placeholder="e.g. 9876543210"
                  value={formData.patientPhone}
                  onChange={handleChange('patientPhone')}
                  error={errors.patientPhone}
                  required
                />
              </div>
            </div>

            {/* Clinical Parameters Configuration */}
            <div className="space-y-6 pt-2">
              <h3 className={`text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${isEmergency ? 'text-red-600/70 border-red-100' : 'text-neutral-400 border-neutral-100'}`}>
                <FileText className="w-4 h-4" /> Consultation Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Special Priority Override */}
                 <div className="md:col-span-2 p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <label className="block text-sm font-semibold text-neutral-800">
                      Triage & Urgency Assessment <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <button
                         type="button"
                         onClick={() => setUrgency('normal')}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all border ${!isEmergency ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-100' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'}`}
                       >
                         <Activity className="w-4 h-4" /> Routine Check-up
                       </button>
                       <button
                         type="button"
                         onClick={() => setUrgency('emergency')}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all border ${isEmergency ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-100' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                       >
                         <ShieldAlert className="w-4 h-4" /> Emergency Triage
                       </button>
                    </div>
                 </div>

                 {/* Doctor Selection */}
                 <div className="md:col-span-2">
                    <Select
                      label="Assign Doctor"
                      id="walkin-doctor"
                      icon={Stethoscope}
                      options={[
                        { value: '', label: loadingDoctors ? 'Loading doctors...' : 'Select a practitioner...' },
                        ...doctors.map(d => ({
                           value: d._id || d.doctorId,
                           label: `Dr. ${d.name} (${d.specialization || 'General'})`
                        }))
                      ]}
                      value={formData.doctorId}
                      onChange={handleChange('doctorId')}
                      error={errors.doctorId}
                      required
                    />
                 </div>

                 {/* Date & Slot Fetching Bindings */}
                 <Input
                   label="Appointment Date"
                   id="walkin-date"
                   type="date"
                   min={getTodayString()}
                   max={getMaxDateString()}
                   icon={Calendar}
                   value={formData.date}
                   onChange={handleChange('date')}
                   error={errors.date}
                   required
                 />

                 <div className="space-y-1.5">
                   <label htmlFor="walkin-time" className="block text-sm font-semibold text-neutral-700">
                     Time Slot <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                      <div className="absolute top-3 left-3 text-neutral-400 pointer-events-none">
                        <Clock className="w-5 h-5" />
                      </div>
                      <select
                        id="walkin-time"
                        value={formData.timeSlot}
                        onChange={handleChange('timeSlot')}
                        disabled={!formData.doctorId || !formData.date || loadingSlots}
                        className={`w-full pl-10 appearance-none bg-white border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors shadow-xs ${errors.timeSlot ? 'border-red-300 ring-1 ring-red-300 bg-red-50/30' : 'border-neutral-300'} ${(!formData.doctorId || !formData.date) ? 'bg-neutral-100 cursor-not-allowed text-neutral-400' : 'text-neutral-800'}`}
                      >
                         <option value="">
                            {!formData.doctorId || !formData.date 
                               ? 'Select doctor & date first' 
                               : loadingSlots 
                                   ? 'Fetching slots...' 
                                   : availableSlots.length === 0 
                                       ? 'No slots available' 
                                       : 'Select an available slot...'}
                         </option>
                         
                         {availableSlots.map((slot, i) => {
                            const val = typeof slot === 'string' ? slot : (slot.time || slot.slot);
                            return <option key={i} value={val}>{val}</option>;
                         })}
                      </select>
                      {/* Custom dropdown caret */}
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                   </div>
                   {errors.timeSlot && <p className="text-sm text-red-500 mt-1">{errors.timeSlot}</p>}
                 </div>

              </div>
            </div>

            {/* Validation & Submit Boundaries */}
            <div className={`pt-6 border-t flex items-center justify-end ${isEmergency ? 'border-red-200' : 'border-neutral-100'}`}>
               <Button 
                  type="submit" 
                  icon={CheckCircle2} 
                  loading={isSubmitting}
                  variant={isEmergency ? 'danger' : 'primary'}
                  className="w-full sm:w-auto px-8"
               >
                  {isEmergency ? 'Create Emergency Booking' : 'Confirm Offline Booking'}
               </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { OfflineBookingPage };
export default OfflineBookingPage;
