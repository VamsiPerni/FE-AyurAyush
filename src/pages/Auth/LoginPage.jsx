import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Lock, Leaf } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await login(email, password);
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-dark-elevated border border-neutral-100 dark:border-dark-border overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-neutral-50 dark:border-dark-border">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-1">AyurAyush</h1>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-[0.2em] mb-6">
            Healthcare Management
          </p>
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Welcome Back</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Sign in to continue your healthcare journey</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="login-email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
              placeholder="you@example.com"
              required
              error={errors.email}
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
              placeholder="••••••••"
              required
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 dark:border-dark-border text-primary-600 focus:ring-primary-500 dark:bg-dark-elevated"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export { LoginPage };
export default LoginPage;
