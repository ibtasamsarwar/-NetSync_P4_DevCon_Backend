import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function PasswordResetSuccessPage() {
  return (
    <div className="bg-surface min-h-screen flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-icons text-2xl">sync</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-dark">NetSync</span>
      </div>

      {/* Success card */}
      <main className="w-full max-w-md">
        <div className="bg-white border border-primary/10 rounded-xl shadow-xl p-8 md:p-10 text-center">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-pulse" />
            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-icons text-white text-5xl">check</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-10">
            <h1 className="text-3xl font-bold text-charcoal leading-tight">
              Password Reset Successful
            </h1>
            <p className="text-gray-500 text-lg">
              Your account security has been updated. You can now log in with your new credentials.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link to="/login">
              <Button className="w-full py-4 group">
                Proceed to Login
                <span className="material-icons text-xl ml-2">arrow_forward</span>
              </Button>
            </Link>
            <div className="pt-2">
              <Link
                to="/"
                className="text-gray-400 hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <span className="material-icons text-base">home</span>
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Protected by enterprise-grade encryption
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-gray-400">
            <span className="material-icons text-sm">lock</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">256-bit SSL Secured</span>
          </div>
        </div>
      </main>
    </div>
  );
}
