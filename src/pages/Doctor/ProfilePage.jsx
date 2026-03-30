import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Stethoscope, Award, 
  Briefcase, Banknote, AlertTriangle, FileText, Info
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { showErrorToast } from '../../utils/toastMessageHelper';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchFn = doctorService.getDoctorProfile || doctorService.getProfile;
      const result = await fetchFn();
      setProfile(result.data?.profile || result.data || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load profile details.';
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const formatDateIN = (dateStr) => {
    if (!dateStr) return 'Not Provided';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Not Provided';
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Not Provided';
    }
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    return nameStr.charAt(0).toUpperCase();
  };

  // State: Loading
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <PageHeader title="Doctor Profile" subtitle="Your professional information and credentials" />
        <CardSkeleton />
      </div>
    );
  }

  // State: Error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <PageHeader title="Doctor Profile" subtitle="Your professional information and credentials" />
        <Card className="py-12">
          <EmptyState
            icon={AlertTriangle}
            title="Failed to Load"
            description={error}
            action={<Button onClick={loadProfile}>Retry</Button>}
          />
        </Card>
      </div>
    );
  }

  // State: Empty
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <PageHeader title="Doctor Profile" subtitle="Your professional information and credentials" />
        <Card className="py-12">
          <EmptyState
            icon={FileText}
            title="Profile Not Found"
            description="We couldn't retrieve your professional profile data."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Doctor Profile"
        subtitle="Your professional information and credentials"
      />

      {/* Admin Disclaimer Note */}
      <div className="bg-info-50 flex items-start gap-3 p-4 rounded-xl border border-info-200 text-info-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Read-Only Profile</h4>
          <p className="text-sm mt-0.5 opacity-90">
            For security and verification purposes, doctors cannot self-edit professional details. 
            Please contact the hospital admin directly to request profile modifications.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border border-neutral-100 shadow-sm">
        {/* Profile Identity Layout Block */}
        <div className="bg-primary-50/50 border-b border-primary-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
          
          <div className="absolute top-6 right-6">
            <Badge type="status" value={profile.status || 'Active'} />
          </div>

          <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 font-bold text-3xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm ring-1 ring-primary-100">
            {getInitials(profile.name)}
          </div>
          
          <div className="text-center sm:text-left flex-1 space-y-2 mt-2 sm:mt-1">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Dr. {profile.name || 'Doctor'}</h2>
              <p className="text-primary-700 font-semibold">{profile.specialization || 'General Practice'}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 text-sm text-neutral-600 mt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-4 h-4 text-neutral-400" />
                {profile.email || 'Not Provided'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-neutral-400" />
                {profile.phone || profile.phoneNumber || 'Not Provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials and Clinical Payload Block */}
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            
            {/* Left Column */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Professional Overview</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <Stethoscope className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-0.5">Specialization</p>
                      <p className="font-semibold text-neutral-800">{profile.specialization || 'Not Provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <Award className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-0.5">Qualifications</p>
                      <p className="font-semibold text-neutral-800">{profile.qualification || profile.qualifications || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="p-6 sm:p-8 space-y-6 bg-neutral-50/30">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Practice Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors">
                    <Briefcase className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-0.5">Experience</p>
                      <p className="font-semibold text-neutral-800">{profile.experience ? `${profile.experience} Years` : 'Not Provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors">
                    <Banknote className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-0.5">Consultation Fee</p>
                      <p className="font-semibold text-success-700">₹{profile.consultationFee || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Footer Account Meta */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-500">
              <User className="w-4 h-4" />
              <span className="text-sm">Account Status: <span className="font-semibold text-neutral-700 capitalize">{profile.status || 'Active'}</span></span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm tracking-tight text-neutral-400">Joined Data: <span className="font-medium text-neutral-600 ml-1">{formatDateIN(profile.createdAt || profile.dateJoined)}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export { ProfilePage };
export default ProfilePage;
