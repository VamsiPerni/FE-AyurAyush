import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, Check, 
  AlertCircle, ShieldAlert, Save, RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const generateEmptySchedule = () => {
  const schedule = {};
  DAYS_OF_WEEK.forEach(day => {
    schedule[day.key] = { isAvailable: false, slots: [] };
  });
  return schedule;
};

const DoctorAvailabilityPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  const [schedule, setSchedule] = useState(generateEmptySchedule());
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick form state for adding precise slots per day efficiently
  const [slotInputs, setSlotInputs] = useState({});

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingInitial(true);
      setError('');
      const result = await adminService.getDoctors();
      setDoctors(result.data?.doctors || result.data || []);
    } catch (err) {
      setError('Failed to fetch the doctor registry. Please refresh.');
      showErrorToast('Failed to load doctors.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    setSelectedDoctorId(docId);
    setSlotInputs({}); // reset staging input forms
    
    if (!docId) {
      setSchedule(generateEmptySchedule());
      return;
    }

    const doc = doctors.find(d => (d._id || d.doctorId) === docId);
    if (doc && doc.availability) {
      // Re-hydrate the default schedule securely catching unmapped partial objects
      const newSchedule = generateEmptySchedule();
      Object.keys(doc.availability).forEach(key => {
        if (newSchedule[key] !== undefined) {
          newSchedule[key] = {
            isAvailable: doc.availability[key]?.isAvailable || false,
            slots: Array.isArray(doc.availability[key]?.slots) ? [...doc.availability[key].slots] : []
          };
        }
      });
      setSchedule(newSchedule);
    } else {
      setSchedule(generateEmptySchedule());
    }
  };

  const handleToggleDay = (dayKey) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isAvailable: !prev[dayKey].isAvailable
      }
    }));
  };

  const handleRemoveSlot = (dayKey, slotIndex) => {
    setSchedule(prev => {
      const dayData = { ...prev[dayKey] };
      dayData.slots = dayData.slots.filter((_, i) => i !== slotIndex);
      return { ...prev, [dayKey]: dayData };
    });
  };

  const handleSlotInputChange = (dayKey, field, value) => {
    setSlotInputs(prev => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || { start: '', end: '' }),
        [field]: value
      }
    }));
  };

  const handleAddSlot = (dayKey) => {
    const input = slotInputs[dayKey];
    if (!input || !input.start || !input.end) {
      showErrorToast('Please provide both start and end times clearly.');
      return;
    }

    const slotString = `${input.start} - ${input.end}`;
    
    setSchedule(prev => {
      const dayData = { ...prev[dayKey] };
      if (!dayData.slots.includes(slotString)) {
         dayData.slots = [...dayData.slots, slotString].sort();
      }
      return { ...prev, [dayKey]: dayData };
    });

    // Clear input safely
    handleSlotInputChange(dayKey, 'start', '');
    handleSlotInputChange(dayKey, 'end', '');
  };

  const handleSave = async () => {
    if (!selectedDoctorId) {
      showErrorToast('Please select a doctor to assign these time slots.');
      return;
    }

    try {
      setIsSaving(true);
      await adminService.updateDoctorAvailability(selectedDoctorId, { availability: schedule });
      showSuccessToast('Availability matrix updated successfully');
      
      // Opt: Refresh doc object array safely so toggling back/forth persists natively
      // loadDoctors() could be called or just assume state matches. 
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <PageHeader title="Doctor Availability" subtitle="Loading registry..." />
        <div className="h-14 bg-neutral-100 dark:bg-dark-elevated rounded-xl animate-pulse w-full max-w-sm" />
        <Card className="p-12 border-neutral-100 flex items-center justify-center">
           <div className="h-40 w-full animate-pulse bg-neutral-50/50 rounded-lg" />
        </Card>
      </div>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="Data Synchronization Error"
          description={error}
          action={<Button icon={RefreshCw} onClick={loadDoctors}>Retry Operation</Button>}
        />
      </div>
    );
  }

  const doctorOptions = [
    { value: '', label: 'Select a Doctor...' },
    ...doctors.map(d => ({
      value: d._id || d.doctorId,
      label: `Dr. ${d.name} (${d.specialization || 'General'})`
    }))
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Doctor Availability"
        subtitle="Manage working days and precisely block consultable time segments for clinical staff."
      />

      {/* Step 1: Selector Component */}
      <Card className="border-neutral-200 dark:border-dark-border shadow-sm overflow-visible z-10 relative">
        <CardContent className="p-6">
           <Select
             label="Target Doctor"
             id="doctor-selector"
             icon={Calendar}
             options={doctorOptions}
             value={selectedDoctorId}
             onChange={handleDoctorChange}
             disabled={isSaving}
           />
        </CardContent>
      </Card>

      {/* Step 2: Editor Flow */}
      {!selectedDoctorId ? (
         <Card className="border-neutral-100 dark:border-dark-border shadow-none bg-neutral-50/50 dark:bg-dark-elevated/50">
           <div className="py-20 text-center">
              <div className="w-16 h-16 bg-white dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-dark-border shadow-sm">
               <Clock className="w-8 h-8 text-neutral-300" />
             </div>
              <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">Select a Practitioner First</h3>
             <p className="text-neutral-500 text-sm mt-1">Pick a doctor from the list above to modify their weekly roster.</p>
           </div>
         </Card>
      ) : (
         <Card className="border-primary-100 dark:border-dark-border shadow-sm overflow-hidden animate-in slide-in-from-bottom-2">
            <CardHeader className="bg-primary-50/50 dark:bg-primary-900/10 border-b border-primary-50 dark:border-dark-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary-800 dark:text-primary-300 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Schedule Grid
                </CardTitle>
                <p className="text-sm text-primary-700/70 mt-1 font-medium">Standardize the availability of your practitioner per day.</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-neutral-100 dark:divide-dark-border">
                 {DAYS_OF_WEEK.map((day) => {
                   const dayData = schedule[day.key];
                   const isAvail = dayData.isAvailable;
                   const inputState = slotInputs[day.key] || { start: '', end: '' };

                   return (
                     <div key={day.key} className={`p-5 lg:p-6 transition-colors ${isAvail ? 'bg-white dark:bg-dark-card' : 'bg-neutral-50/80 dark:bg-dark-elevated/50'}`}>
                       <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                          
                          {/* Day Header & Toggle */}
                          <div className="w-40 shrink-0">
                            <label className="flex items-center cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isAvail}
                                  onChange={() => handleToggleDay(day.key)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${isAvail ? 'bg-primary-600' : 'bg-neutral-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isAvail ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                              <span className={`ml-3 font-semibold text-sm ${isAvail ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                                {day.label}
                              </span>
                            </label>
                          </div>

                          {/* Slots Configuration */}
                          <div className="flex-1">
                             {!isAvail ? (
                               <p className="text-sm italic text-neutral-400 mt-1">Not marked as available on this day.</p>
                             ) : (
                               <div className="space-y-4">
                                  {/* List Slots */}
                                  {dayData.slots.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {dayData.slots.map((slot, index) => (
                                        <div key={index} className="flex items-center bg-primary-50 dark:bg-primary-900/10 border border-primary-200/60 dark:border-primary-700/40 rounded-lg overflow-hidden group">
                                          <span className="px-3 py-1.5 text-sm font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 opacity-60" />
                                            {slot}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveSlot(day.key, index)}
                                            className="px-2 py-1.5 hover:bg-red-100 hover:text-red-600 text-primary-400 transition-colors h-full border-l border-primary-200/60"
                                            title="Remove Time Slot"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-700/40 font-medium">
                                      <ShieldAlert className="w-4 h-4" /> No time slots allocated yet. Setup parameters below.
                                    </div>
                                  )}

                                  {/* Add Component Sequence */}
                                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 pb-1 lg:max-w-md">
                                    <input 
                                       type="time" 
                                       value={inputState.start}
                                       onChange={(e) => handleSlotInputChange(day.key, 'start', e.target.value)}
                                       className="w-full sm:w-auto bg-white dark:bg-dark-elevated border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 px-3 py-2 shadow-xs transition-colors"
                                    />
                                    <span className="text-neutral-400 hidden sm:block">to</span>
                                    <input 
                                       type="time" 
                                       value={inputState.end}
                                       onChange={(e) => handleSlotInputChange(day.key, 'end', e.target.value)}
                                       className="w-full sm:w-auto bg-white dark:bg-dark-elevated border border-neutral-300 dark:border-dark-border text-neutral-800 dark:text-neutral-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 px-3 py-2 shadow-xs transition-colors"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      icon={Plus} 
                                      className="w-full sm:w-auto mt-2 sm:mt-0"
                                      onClick={() => handleAddSlot(day.key)}
                                      disabled={!inputState.start || !inputState.end}
                                    >
                                      Append Rule
                                    </Button>
                                  </div>
                               </div>
                             )}
                          </div>

                       </div>
                     </div>
                   );
                 })}
               </div>

               {/* Master Save Trigger */}
               <div className="p-6 bg-neutral-50/80 dark:bg-dark-elevated/80 border-t border-neutral-200 dark:border-dark-border">
                  <Button 
                    variant="primary" 
                    icon={Save} 
                    loading={isSaving} 
                    onClick={handleSave}
                    className="w-full md:w-auto"
                  >
                    Commit Global Schedule
                  </Button>
               </div>
            </CardContent>
         </Card>
      )}
    </div>
  );
};

export { DoctorAvailabilityPage };
export default DoctorAvailabilityPage;
