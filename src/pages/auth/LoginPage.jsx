import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { authAPI } from '../../api';

const ROLES = [
  { id: 'super_admin', label: 'Super Admin', icon: 'admin_panel_settings' },
  { id: 'organizer', label: 'Organizer', icon: 'event_seat' },
  { id: 'staff', label: 'Staff', icon: 'badge' },
  { id: 'attendee', label: 'Attendee', icon: 'groups' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('organizer');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    confirm_password: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(form.email, form.password);
        if (res.requires_2fa) {
          navigate('/auth/2fa', { state: { email: form.email } });
        } else {
          navigate('/dashboard');
        }
      } else {
        if (form.password !== form.confirm_password) {
          toast.error('Passwords do not match');
          return;
        }
        await register({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          role: selectedRole,
        });
        setVerifyEmail(form.email);
        setShowVerification(true);
        toast.success('Verification code sent to your email!');
        startResendCooldown();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong';
      if (detail.includes('not verified')) {
        setVerifyEmail(form.email);
        setShowVerification(true);
        toast('A verification code has been sent to your email.', { icon: '📧' });
        startResendCooldown();
      } else {
        toast.error(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Paste support
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ email: verifyEmail, otp: code });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setUser(data.user);
      toast.success('Email verified! Welcome to NetSync!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      await authAPI.resendOTP(verifyEmail);
      toast.success('New code sent!');
      setOtp(['', '', '', '', '', '']);
      startResendCooldown();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resend code');
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@netsync.io', 'demo123456');
      toast.success('Welcome, Demo User!');
      navigate('/dashboard');
    } catch {
      toast.error('Demo login unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center mb-10">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons text-white">hub</span>
          </div>
          <span className="ml-3 text-2xl font-bold text-charcoal">NetSync</span>
        </div>

        {showVerification ? (
          /* ── Email Verification OTP Screen ── */
          <div>
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-icons-outlined text-primary text-3xl">mark_email_read</span>
              </div>
              <h2 className="text-3xl font-bold text-charcoal mb-2">Verify Your Email</h2>
              <p className="text-gray-500">
                We sent a 6-digit code to <strong className="text-charcoal">{verifyEmail}</strong>
              </p>
            </div>

            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={clsx(
                    'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all',
                    digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 focus:border-primary'
                  )}
                />
              ))}
            </div>

            <Button onClick={handleVerifyOTP} className="w-full py-4" loading={loading}>
              Verify & Continue
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  className={clsx(
                    'font-bold transition-opacity',
                    resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:opacity-80'
                  )}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </p>
            </div>

            <button
              onClick={() => { setShowVerification(false); setOtp(['', '', '', '', '', '']); }}
              className="mt-8 flex items-center gap-1 text-sm text-gray-500 hover:text-charcoal transition-colors mx-auto"
            >
              <span className="material-icons text-[16px]">arrow_back</span>
              Back to login
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-charcoal mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500">
                {isLogin ? 'Access your professional dashboard.' : 'Join the NetSync community.'}
              </p>
            </div>

            {/* Role selector */}
            <div className="mb-8">
              <label className="block text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-[0.15em]">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const active = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={clsx(
                        'group relative flex flex-col items-center p-4 rounded-xl transition-all duration-200',
                        active
                          ? 'border-2 border-primary bg-primary/[0.03]'
                          : 'border border-gray-200 hover:border-primary/40'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                          active ? 'bg-primary/10' : 'bg-gray-50 group-hover:bg-primary/10'
                        )}
                      >
                        <span
                          className={clsx(
                            'material-symbols-outlined transition-colors',
                            active ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                          )}
                        >
                          {role.icon}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          'text-xs transition-colors',
                          active ? 'font-bold text-primary' : 'font-semibold text-gray-600 group-hover:text-primary'
                        )}
                      >
                        {role.label}
                      </span>
                      {active && (
                        <div className="absolute top-2 right-2">
                          <span className="material-icons text-primary text-[16px]">check_circle</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              )}
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
              />
              <div>
                {isLogin && (
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <Link to="/auth/forgot-password" className="text-xs font-semibold text-primary hover:opacity-80">
                      Forgot password?
                    </Link>
                  </div>
                )}
                <Input
                  label={isLogin ? undefined : 'Password'}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && (
                <Input
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              )}
              <Button type="submit" className="w-full py-4 mt-2" loading={loading}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-surface text-gray-400">Quick Access</span>
              </div>
            </div>

            {/* Demo button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-primary/30 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-4 rounded-xl transition-all group"
              >
                <span className="material-symbols-outlined text-primary">play_circle</span>
                Continue as Demo User
              </button>
            </div>

            {/* Toggle form */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500">
                {isLogin ? 'New to the community?' : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-primary hover:opacity-80 ml-1 transition-opacity"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Footer links */}
            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Help</a>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
