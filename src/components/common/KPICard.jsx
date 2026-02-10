import { clsx } from 'clsx';

export default function KPICard({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) {
  const isUp = trend === 'up';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-charcoal mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            color === 'primary' && 'bg-primary/10',
            color === 'green' && 'bg-green-50',
            color === 'blue' && 'bg-blue-50',
            color === 'purple' && 'bg-purple-50',
          )}>
            <span className={clsx(
              'material-icons text-[20px]',
              color === 'primary' && 'text-primary',
              color === 'green' && 'text-green-600',
              color === 'blue' && 'text-blue-600',
              color === 'purple' && 'text-purple-600',
            )}>
              {icon}
            </span>
          </div>
        )}
      </div>
      {trendValue && (
        <div className="flex items-center gap-1 mt-2">
          <span className={clsx('material-icons text-[14px]', isUp ? 'text-green-500' : 'text-red-500')}>
            {isUp ? 'trending_up' : 'trending_down'}
          </span>
          <span className={clsx('text-xs font-semibold', isUp ? 'text-green-600' : 'text-red-600')}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
