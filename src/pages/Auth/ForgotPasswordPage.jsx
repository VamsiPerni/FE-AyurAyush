import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Leaf } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { showErrorToast, showSuccessToast } from '../../utils/toastMessageHelper';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      showSuccessToast('Check your email for reset instructions');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Unable to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-dark-elevated border border-neutral-100 dark:border-dark-border overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center border-b border-neutral-50 dark:border-dark-border">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-1">AyurAyush</h1>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-[0.2em] mb-6">Healthcare Management</p>
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Forgot Password</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Enter your email to receive an OTP</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" id="forgot-email" type="email" icon={Mail} value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              placeholder="you@example.com" required error={error} />
            <Button type="submit" fullWidth loading={loading}>Send Reset Instructions</Button>
          </form>
        </div>
        <div className="px-8 pb-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export { ForgotPasswordPage };
export default ForgotPasswordPage;
