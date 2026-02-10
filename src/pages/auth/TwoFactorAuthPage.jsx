import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function TwoFactorAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify2FA } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(55);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(paste)) {
      const newOtp = paste.split('').concat(Array(6 - paste.length).fill(''));
      setOtp(newOtp);
      inputRefs.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      await verify2FA(email, code);
      toast.success('Identity verified!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid code');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'al***@netsync.io';

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-4 relative">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl mb-4 shadow-lg shadow-primary/20">
            <span className="material-icons text-white text-2xl">sync</span>
          </div>
          <h2 className="text-xl font-bold text-primary tracking-tight">NetSync</h2>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl shadow-primary/5 border border-primary/10 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-charcoal mb-2">Verify your identity</h1>
            <p className="text-gray-500 text-sm">
              We've sent a 6-digit code to your email <br />
              <span className="font-medium text-gray-700">{maskedEmail}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP inputs */}
            <div className="flex justify-between gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                />
              ))}
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full py-4 group" loading={loading}>
                <span>Verify Identity</span>
                <span className="material-icons text-sm group-hover:translate-x-1 transition-transform ml-2">
                  arrow_forward
                </span>
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive a code?{' '}
                  {countdown > 0 ? (
                    <span className="text-primary font-medium opacity-50 ml-1">
                      Resend in 00:{countdown.toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCountdown(55);
                        toast.success('Code resent!');
                      }}
                      className="text-primary font-medium ml-1 hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center items-center gap-6">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span className="material-icons text-base">arrow_back</span>
            Back to Login
          </Link>
          <div className="w-px h-4 bg-gray-300" />
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            Contact Support
          </a>
        </div>

        {/* Security badge */}
        <div className="mt-12 flex justify-center items-center gap-4 opacity-50 hover:opacity-100 transition-all">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-widest">
            <span className="material-icons text-sm">verified_user</span>
            Secure End-to-End Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
