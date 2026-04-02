import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { useAuthContext } from '../../contexts/AppContext';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { roles, activeRole, handleSetUser } = useAuthContext();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (form.newPassword === form.currentPassword) {
      newErrors.newPassword = 'New password must be different from the current one';
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
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      handleSetUser({ mustChangePassword: false });
      showSuccessToast('Password changed successfully');

      if (activeRole) {
        navigate(`/${activeRole}/dashboard`);
      } else if (roles.length === 1) {
        navigate(`/${roles[0]}/dashboard`);
      } else {
        navigate('/choose-role');
      }
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || 'Failed to update password'
      );
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
          <h2 className="text-xl font-semibold text-neutral-800">Change Password Required</h2>
          <p className="text-sm text-neutral-500 mt-1">
            For security, update your temporary password before continuing.
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              id="change-current-password"
              type="password"
              icon={Lock}
              value={form.currentPassword}
              onChange={handleChange('currentPassword')}
              placeholder="Enter current password"
              required
              error={errors.currentPassword}
            />

            <Input
              label="New Password"
              id="change-new-password"
              type="password"
              icon={Lock}
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="Enter new password"
              required
              error={errors.newPassword}
              hint="Minimum 6 characters"
            />

            <Input
              label="Confirm New Password"
              id="change-confirm-password"
              type="password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Confirm new password"
              required
              error={errors.confirmPassword}
            />

            <Button type="submit" fullWidth loading={loading}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export { ChangePasswordPage };
export default ChangePasswordPage;
