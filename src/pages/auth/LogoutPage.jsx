import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = '/';
      return;
    }
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="material-icons text-white text-xl">sync</span>
            </div>
            <span className="text-xl font-bold text-dark tracking-tight">NetSync</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl shadow-primary/5 p-8 md:p-12 text-center border border-gray-100">
          {/* Animated icon */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-primary/20 rounded-full" />
            <div className="relative flex items-center justify-center h-full">
              <span className="material-icons text-primary text-6xl">check_circle</span>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-charcoal mb-4">
            You have been successfully logged out.
          </h1>
          <p className="text-gray-600 text-lg mb-10 max-w-sm mx-auto">
            Thank you for using NetSync to power your event experience. We hope to see you again soon.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/25"
            >
              Login Again
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-3.5 border-2 border-primary/30 hover:border-primary text-primary font-semibold rounded-lg transition-all"
            >
              Go to Home
            </Link>
          </div>

          {/* Countdown */}
          <div className="pt-8 border-t border-gray-100 flex flex-col items-center">
            <div className="flex items-center gap-3 text-gray-500 font-medium">
              <span className="material-icons text-sm animate-spin">autorenew</span>
              Redirecting to homepage in{' '}
              <span className="text-primary font-bold">{countdown}s</span>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-10 flex justify-center gap-6 text-xs text-gray-400 font-medium uppercase tracking-wider">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
        </div>
      </div>
    </div>
  );
}
