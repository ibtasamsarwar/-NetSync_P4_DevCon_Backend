export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <div
        className={`${sizes[size]} border-2 border-gray-200 border-t-primary rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}
