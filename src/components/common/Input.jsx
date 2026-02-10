import { clsx } from 'clsx';

export default function Input({
  label,
  icon,
  error,
  className,
  type = 'text',
  ...props
}) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={clsx(
            'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
            'placeholder:text-gray-400',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
            'transition-all duration-200',
            icon && 'pl-11',
            error && 'border-red-400 focus:ring-red-200 focus:border-red-400'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
