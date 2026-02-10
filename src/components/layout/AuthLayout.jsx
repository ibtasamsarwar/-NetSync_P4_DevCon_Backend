/**
 * AuthLayout - Split-screen layout for auth pages (login, signup, forgot password, etc.)
 * Left panel: branding/illustration. Right panel: form content.
 */

export default function AuthLayout({ children, title, subtitle, illustration }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark relative overflow-hidden items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Net<span className="text-primary">Sync</span>
            </span>
          </div>

          {illustration && (
            <img
              src={illustration}
              alt="NetSync"
              className="w-full max-w-sm mx-auto mb-8 rounded-2xl"
            />
          )}

          <h2 className="text-2xl font-bold text-white mb-3">
            {title || 'Elevate Your Networking Experience'}
          </h2>
          <p className="text-gray-400">
            {subtitle || 'Smart event management powered by AI. Create, manage, and experience events like never before.'}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface relative">
        {/* Decorative blurred circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

        <div className="w-full max-w-md relative z-10">{children}</div>
      </div>
    </div>
  );
}
