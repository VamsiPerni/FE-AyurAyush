import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, Mail, Phone, Lock, Stethoscope, Award, 
  Briefcase, Banknote, Save, X 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const CreateDoctorPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    qualifications: '',
    experience: '',
    consultationFee: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';
      case 'phone':
        return value.trim() ? '' : 'Phone number is required';
      case 'password':
        if (!value) return 'Password is required';
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      case 'specialization':
        return value.trim() ? '' : 'Specialization is required';
      case 'qualifications':
        return value.trim() ? '' : 'Qualifications are required';
      case 'experience':
        if (value === '') return 'Experience is required';
        return Number(value) >= 0 ? '' : 'Experience cannot be negative';
      case 'consultationFee':
        if (value === '') return 'Consultation fee is required';
        return Number(value) >= 0 ? '' : 'Fee cannot be negative';
      default:
        return '';
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors on type
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
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
    
    if (!validateForm()) {
      showErrorToast('Please fix the errors in the form before submitting.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const payload = {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee)
      };
      
      await adminService.createDoctorAccount(payload);
      showSuccessToast('Doctor account created successfully');
      navigate('/admin/doctors');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to create doctor account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Create Doctor Account"
        subtitle="Provision a new clinical practitioner directly into the system registry."
        backTo="/admin/doctors"
      />

      <Card className="border-neutral-200 dark:border-dark-border shadow-sm overflow-hidden">
        <CardHeader className="bg-neutral-50/70 dark:bg-dark-elevated/70 border-b border-neutral-100 dark:border-dark-border pb-4">
          <CardTitle className="text-neutral-800 dark:text-neutral-100 text-lg">Practitioner Details</CardTitle>
          <p className="text-sm text-neutral-500 mt-1">All fields are mandatory to ensure complete system records.</p>
        </CardHeader>
        
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            {/* Identity & Contact Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-dark-border pb-2">Identity & Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  id="doc-name"
                  icon={User}
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                  required
                />
                
                <Input
                  label="Email Address"
                  id="doc-email"
                  type="email"
                  icon={Mail}
                  placeholder="doctor@ayurayush.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  required
                />
                
                <Input
                  label="Phone Number"
                  id="doc-phone"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                  required
                />
                
                <Input
                  label="Temporary Password"
                  id="doc-password"
                  type="password"
                  icon={Lock}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                  required
                />
              </div>
            </div>

            {/* Clinical Metadata Section */}
            <div className="space-y-6 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-dark-border pb-2">Clinical Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2">
                   <Input
                     label="Primary Specialization"
                     id="doc-specialization"
                     icon={Stethoscope}
                     placeholder="e.g. Ayurvedic Dermatology, Panchakarma Specialist"
                     value={formData.specialization}
                     onChange={handleChange('specialization')}
                     error={errors.specialization}
                     required
                   />
                </div>
                
                <Input
                  label="Years of Experience"
                  id="doc-experience"
                  type="number"
                  min="0"
                  icon={Briefcase}
                  placeholder="e.g. 10"
                  value={formData.experience}
                  onChange={handleChange('experience')}
                  error={errors.experience}
                  required
                />
                
                <Input
                  label="Consultation Fee (₹)"
                  id="doc-fee"
                  type="number"
                  min="0"
                  icon={Banknote}
                  placeholder="e.g. 500"
                  value={formData.consultationFee}
                  onChange={handleChange('consultationFee')}
                  error={errors.consultationFee}
                  required
                />

                <div className="md:col-span-2">
                  <div className="space-y-1.5">
                    <label htmlFor="doc-qualifications" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Degrees & Qualifications <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-neutral-400 pointer-events-none">
                        <Award className="w-5 h-5" />
                      </div>
                      <Textarea
                        id="doc-qualifications"
                        placeholder="e.g. BAMS, MD (Ayurveda)"
                        value={formData.qualifications}
                        onChange={handleChange('qualifications')}
                        className={`w-full pl-10 resize-y min-h-[100px] bg-neutral-50 dark:bg-dark-elevated border rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-shadow ${errors.qualifications ? 'border-red-300 ring-1 ring-red-300 bg-red-50/30 dark:bg-red-900/10' : 'border-neutral-200 dark:border-dark-border'}`}
                      />
                    </div>
                    {errors.qualifications && <p className="text-sm text-red-500 mt-1">{errors.qualifications}</p>}
                  </div>
                </div>

              </div>
            </div>
            
            {/* Actions Layer */}
            <div className="pt-6 border-t border-neutral-100 dark:border-dark-border flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                icon={X} 
                onClick={() => navigate('/admin/doctors')}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel Creation
              </Button>
              <Button 
                type="submit" 
                icon={Save} 
                loading={isSubmitting}
                className="w-full sm:w-auto sm:ml-auto"
              >
                Create Doctor Account
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
      
    </div>
  );
};

export { CreateDoctorPage };
export default CreateDoctorPage;
