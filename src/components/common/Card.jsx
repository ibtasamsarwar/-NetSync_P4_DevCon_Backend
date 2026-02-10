import { clsx } from 'clsx';

export default function Card({ children, className, hover, padding = 'p-6', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-gray-100 shadow-soft',
        padding,
        hover && 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon, className }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-charcoal flex items-center gap-2', className)}>
      {icon && <span className="material-icons text-primary text-[20px]">{icon}</span>}
      {children}
    </h3>
  );
}
