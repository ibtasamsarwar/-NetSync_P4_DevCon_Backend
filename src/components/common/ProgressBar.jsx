import { clsx } from 'clsx';

export default function ProgressBar({ value = 0, max = 100, color = 'primary', label, showValue, className, size = 'md' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-charcoal">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
