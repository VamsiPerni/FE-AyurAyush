import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Mail, Phone, Lock, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { authService } from '../../services/authService';
import { otpService } from '../../services/otpService';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '', dob: '',
    password: '', confirmPassword: '', otp: '',
  });

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\+?\d{10,13}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid phone number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (isOtpSent && !form.otp.trim()) errs.otp = 'OTP is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async () => {
    // Validate email first
    if (!form.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
      return;
    }
    try {
      setSendingOTP(true);
      const checkResult = await authService.checkEmail(form.email);
      if (checkResult.exists) {
        showErrorToast('Email is already registered. Please login.');
        return;
      }
      await otpService.sendOtp(form.email);
      showSuccessToast('OTP sent to your email!');
      setIsOtpSent(true);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !isOtpSent) return;
    try {
      setLoading(true);
      await authService.signup({
        name: form.name, email: form.email, phone: form.phone,
        gender: form.gender, dob: form.dob,
        password: form.password, otp: form.otp,
      });
      showSuccessToast('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-neutral-50">
          <h1 className="text-2xl font-bold text-primary-600 mb-1">AyurAyush</h1>
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-[0.2em] mb-6">
            Healthcare Management
          </p>
          <h2 className="text-xl font-semibold text-neutral-800">Create Account</h2>
          <p className="text-sm text-neutral-500 mt-1">Start your Ayurveda healthcare journey</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name" id="signup-name" icon={User}
              value={form.name} onChange={set('name')}
              placeholder="John Doe" required error={errors.name}
            />

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="Email" id="signup-email" type="email" icon={Mail}
                  value={form.email} onChange={set('email')}
                  placeholder="you@example.com" required
                  readOnly={isOtpSent} error={errors.email}
                />
              </div>
              {!isOtpSent && (
                <Button
                  type="button" variant="secondary" size="sm"
                  onClick={handleSendOtp} loading={sendingOTP}
                  className="mb-0.5"
                >
                  Get OTP
                </Button>
              )}
            </div>

            {isOtpSent && (
              <Input
                label="OTP" id="signup-otp" icon={KeyRound}
                value={form.otp} onChange={set('otp')}
                placeholder="Enter 6-digit OTP" required error={errors.otp}
              />
            )}

            <Input
              label="Phone Number" id="signup-phone" icon={Phone}
              value={form.phone} onChange={set('phone')}
              placeholder="+91 9876543210" required error={errors.phone}
            />

            <Select
              label="Gender" id="signup-gender"
              value={form.gender} onChange={set('gender')}
              placeholder="Select gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <Input
              label="Date of Birth" id="signup-dob" type="date"
              value={form.dob} onChange={set('dob')}
            />

            <Input
              label="Password" id="signup-password" type="password" icon={Lock}
              value={form.password} onChange={set('password')}
              placeholder="••••••••" required error={errors.password}
              hint="Minimum 6 characters"
            />

            <Input
              label="Confirm Password" id="signup-confirm" type="password" icon={Lock}
              value={form.confirmPassword} onChange={set('confirmPassword')}
              placeholder="••••••••" required error={errors.confirmPassword}
            />

            {isOtpSent && (
              <Button type="submit" fullWidth loading={loading}>
                Create Account
              </Button>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export { SignupPage };
export default SignupPage;
