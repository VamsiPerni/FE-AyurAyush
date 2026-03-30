import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Heart, AlertTriangle, FileText, Check, X, Edit2 } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: '' // yyyy-mm-dd for input
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await patientService.getPatientProfile();
      const data = result.data?.profile || result.data || null;
      setProfile(data);
      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || data.phoneNumber || '',
          gender: data.gender || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : ''
        });
      }
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - revert to original
      setFormData({
        name: profile?.name || '',
        phone: profile?.phone || profile?.phoneNumber || '',
        gender: profile?.gender || '',
        dob: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showErrorToast('Name is required');
      return;
    }

    try {
      setSaving(true);
      await patientService.updatePatientProfile({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob
      });
      
      showSuccessToast('Profile updated successfully');
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob
      }));
      
      setIsEditing(false);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Format date safely safely for en-IN spec
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
      <div className="max-w-3xl mx-auto space-y-6 pb-8">
        <PageHeader title="My Profile" subtitle="Manage your personal information" />
        <CardSkeleton />
      </div>
    );
  }

  // State: Error
  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-8">
        <PageHeader title="My Profile" subtitle="Manage your personal information" />
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

  // State: Empty / Not Found
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-8">
        <PageHeader title="My Profile" subtitle="Manage your personal information" />
        <Card className="py-12">
          <EmptyState
            icon={FileText}
            title="Profile Not Found"
            description="We couldn't retrieve your profile data."
          />
        </Card>
      </div>
    );
  }

  const emailField = profile.email || 'Not Provided';
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and contact details"
      />

      <Card className="overflow-hidden">
        {/* Profile Header Block */}
        <div className="bg-primary-50/50 border-b border-primary-100 p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 font-bold text-3xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm ring-1 ring-primary-100">
            {getInitials(profile.name)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">{profile.name || 'Patient User'}</h2>
            <p className="text-primary-700 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail className="w-4 h-4" />
              {emailField}
            </p>
          </div>
          <div className="shrink-0 mt-2 sm:mt-0">
            {!isEditing && (
              <Button onClick={handleEditToggle} variant="outline" icon={Edit2}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Info / Editing Form Block */}
        <CardContent className="p-6 sm:p-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  id="profile-name"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Enter your full name"
                  required
                />
                
                <Input
                  label="Email Address"
                  id="profile-email"
                  icon={Mail}
                  value={emailField}
                  disabled
                  hint="Email cannot be changed"
                />

                <Input
                  label="Phone Number"
                  id="profile-phone"
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="Enter phone number"
                />

                <Select
                  label="Gender"
                  id="profile-gender"
                  icon={Heart}
                  value={formData.gender}
                  onChange={handleChange('gender')}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                  ]}
                />

                <Input
                  label="Date of Birth"
                  id="profile-dob"
                  type="date"
                  icon={Calendar}
                  value={formData.dob}
                  onChange={handleChange('dob')}
                  max={new Date().toISOString().split('T')[0]} // cannot pick future date
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  icon={X} 
                  onClick={handleEditToggle}
                  disabled={saving}
                  className="sm:w-1/2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  icon={Check} 
                  loading={saving}
                  className="sm:w-1/2"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="p-4 rounded-xl bg-neutral-50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-neutral-200">
                    <User className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Full Name</h3>
                    <p className="text-neutral-800 font-medium">{profile.name || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-neutral-200">
                    <Phone className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Phone Number</h3>
                    <p className="text-neutral-800 font-medium">{profile.phone || profile.phoneNumber || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-neutral-200">
                    <Calendar className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Date of Birth</h3>
                    <p className="text-neutral-800 font-medium">{formatDateIN(profile.dob)}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-neutral-200">
                    <Heart className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Gender</h3>
                    <p className="text-neutral-800 font-medium capitalize">
                      {profile.gender ? profile.gender.replace(/_/g, ' ') : 'Not Provided'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { ProfilePage };
export default ProfilePage;
