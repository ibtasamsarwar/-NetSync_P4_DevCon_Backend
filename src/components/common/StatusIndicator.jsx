import { clsx } from 'clsx';

export default function StatusIndicator({ status = 'online', label, pulse }) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    live: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors[status])} />
        )}
        <span className={clsx('relative inline-flex rounded-full h-2.5 w-2.5', colors[status])} />
      </span>
      {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
    </div>
  );
}
