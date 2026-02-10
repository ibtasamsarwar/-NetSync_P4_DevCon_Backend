import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Recovery link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Stay Secure. Stay Synced."
      subtitle="Recovering your access is quick and easy. We take security seriously to ensure your data remains protected at all times."
    >
      <div className="w-full max-w-md mx-auto">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-12 lg:hidden">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons text-white text-2xl">sync</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-charcoal">NetSync</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-charcoal mb-3">Reset your password</h1>
          <p className="text-gray-500">Enter your email to receive a recovery link.</p>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-green-600 text-3xl">mark_email_read</span>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Check your inbox</h3>
            <p className="text-gray-500 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="mx-auto">
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              icon="mail_outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
            <Button type="submit" className="w-full py-4" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-12 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline group"
          >
            <span className="material-icons text-xl group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back to Login
          </Link>
        </div>

        {/* Support */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            Having trouble?{' '}
            <a href="#" className="text-charcoal font-semibold hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
