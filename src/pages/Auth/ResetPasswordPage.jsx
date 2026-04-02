import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [form, setForm] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // If no email in state, redirect to forgot-password
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.otp.trim()) newErrors.otp = 'OTP is required';
    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await authService.resetPassword({
        email,
        otp: form.otp,
        newPassword: form.newPassword,
      });

      showSuccessToast('Password reset successful');
      navigate('/login');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      await authService.forgotPassword(email);
      showSuccessToast('New OTP sent to your email');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
          <h2 className="text-xl font-semibold text-neutral-800">Reset Password</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Verify OTP sent to <strong>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="OTP"
              id="reset-otp"
              icon={KeyRound}
              value={form.otp}
              onChange={handleChange('otp')}
              placeholder="Enter 6-digit OTP"
              required
              error={errors.otp}
            />

            <Input
              label="New Password"
              id="reset-new-password"
              type="password"
              icon={Lock}
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="••••••••"
              required
              error={errors.newPassword}
              hint="Minimum 6 characters"
            />

            <Input
              label="Confirm Password"
              id="reset-confirm-password"
              type="password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="••••••••"
              required
              error={errors.confirmPassword}
            />

            <Button type="submit" fullWidth loading={loading}>
              Reset Password
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center space-y-4">
          <p className="text-sm text-neutral-500">
            Didn&apos;t receive code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ResetPasswordPage };
export default ResetPasswordPage;
