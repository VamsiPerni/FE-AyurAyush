import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Calendar, Search, Clock, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { useAuthContext } from '../../contexts/AppContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { DoctorCard } from '../../components/patient/DoctorCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatsSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  // Safe extraction of conversation ID per Spec §12
  const authContext = useAuthContext() || {};
  const conversationId = authContext.conversationId || localStorage.getItem('conversationId');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selections
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadDoctors();
    }
  }, [conversationId]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const result = await patientService.getDoctors();
      setDoctors(result.data?.doctors || result.data || []);
    } catch (err) {
      showErrorToast('Failed to load doctors available for booking.');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      const result = await patientService.getAvailableSlots(doctorId, date);
      setAvailableSlots(result.data?.slots || result.data || []);
    } catch (err) {
      showErrorToast('Failed to load available slots for this date.');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (selectedDoctor && date) {
      loadSlots(selectedDoctor._id || selectedDoctor.doctorId, date);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      showErrorToast('Please complete all selections first.');
      return;
    }
    try {
      setBookingLoading(true);
      await patientService.bookAppointment({
        doctorId: selectedDoctor._id || selectedDoctor.doctorId,
        date: selectedDate,
        timeSlot: selectedSlot,
        urgencyLevel,
        conversationId,
      });
      // Clear local storage conversation block if successful
      localStorage.removeItem('conversationId');
      showSuccessToast('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Rule 1: Redirect if no conversationId
  if (!conversationId) {
    return <Navigate to="/patient/chatbot" replace />;
  }

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => 
    doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Date boundaries
  const today = new Date().toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Book Appointment"
        subtitle="Complete your booking based on AI consultation"
        backTo={step > 1 ? undefined : "/patient/dashboard"}
        action={step > 1 && (
          <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
      />

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 px-2 sm:px-8">
        {[
          { num: 1, label: 'Select Doctor' },
          { num: 2, label: 'Date & Time' },
          { num: 3, label: 'Confirm' }
        ].map((s, idx) => (
          <div key={s.num} className="flex flex-col items-center gap-2 relative z-10">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors
              ${step >= s.num ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'bg-neutral-100 text-neutral-400'}
            `}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-xs font-semibold ${step >= s.num ? 'text-primary-700' : 'text-neutral-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
        {/* Step connector lines */}
        <div className="absolute left-0 right-0 top-5 -z-10 hidden sm:block px-14">
          <div className="h-1 bg-neutral-100 rounded-full w-full">
            <div 
              className="h-full bg-primary-600 rounded-full transition-all duration-300" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 min-h-[400px]">
          {/* STEP 1: Select Doctor */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Search doctors by name or specialization..."
                    icon={Search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredDoctors.length === 0 ? (
                <EmptyState 
                  icon={Search} 
                  title="No doctors found" 
                  description="Try adjusting your search terms." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => (
                    <DoctorCard 
                      key={doc.doctorId || doc._id} 
                      doctor={doc} 
                      onSelect={handleDoctorSelect} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Select Date</h3>
                <Input 
                  type="date" 
                  icon={Calendar} 
                  value={selectedDate} 
                  onChange={handleDateChange}
                  min={today}
                  max={maxDate}
                  required
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Select Time Slot</h3>
                {!selectedDate ? (
                  <div className="p-6 text-center bg-neutral-50 rounded-lg border border-neutral-100 text-neutral-500 text-sm">
                    Please select a date first to view available time slots.
                  </div>
                ) : loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-lg" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 text-center bg-warning-50 text-warning-700 rounded-lg border border-warning-200 text-sm">
                    No available time slots on this date. Please try another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                          ${selectedSlot === slot 
                            ? 'bg-primary-600 text-white shadow-md tracking-wide' 
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:bg-primary-50'
                          }
                        `}
                      >
                        <Clock className="w-4 h-4" />
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-neutral-100 flex justify-end">
                <Button 
                  icon={ArrowRight} 
                  onClick={() => setStep(3)} 
                  disabled={!selectedDate || !selectedSlot}
                >
                  Continue to Confirmation
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm Booking */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-800">Review Appointment</h3>
                <p className="text-sm text-neutral-500 mt-1">Please confirm the details below before booking.</p>
              </div>

              <Card className="bg-neutral-50 border-neutral-200 shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <span className="text-sm text-neutral-500">Doctor</span>
                    <span className="font-semibold text-neutral-800 tracking-tight">Dr. {selectedDoctor?.name}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <span className="text-sm text-neutral-500">Specialization</span>
                    <span className="font-medium text-neutral-800">{selectedDoctor?.specialization}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <span className="text-sm text-neutral-500">Date</span>
                    <span className="font-medium text-neutral-800">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Time Slot</span>
                    <span className="font-medium text-primary-700">{selectedSlot}</span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Select
                  label="Urgency Level"
                  id="urgency-level"
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'emergency', label: 'Emergency - Requires immediate attention' },
                  ]}
                  // Implementing red styling spec strictly
                  className={urgencyLevel === 'emergency' ? 'border-red-500 outline-red-500 bg-red-50 text-red-900 focus:border-red-600 focus:ring-red-600' : ''}
                />
              </div>

              {urgencyLevel === 'emergency' && (
                <div className="flex gap-3 items-start p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-2">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Emergency appointments are subject to immediate hospital protocol. An extra triage fee may apply upon arrival.
                  </p>
                </div>
              )}

              <div className="pt-6 flex gap-3">
                <Button 
                  type="submit" 
                  fullWidth 
                  onClick={handleBookAppointment} 
                  loading={bookingLoading}
                  variant={urgencyLevel === 'emergency' ? 'danger' : 'primary'}
                >
                  {urgencyLevel === 'emergency' ? 'Confirm Emergency Booking' : 'Confirm Appointment'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { BookAppointmentPage };
export default BookAppointmentPage;
