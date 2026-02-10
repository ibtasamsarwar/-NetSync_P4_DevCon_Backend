import { clsx } from 'clsx';

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, color = 'primary', dot, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        colorMap[color],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            color === 'green' && 'bg-green-500',
            color === 'red' && 'bg-red-500',
            color === 'amber' && 'bg-amber-500',
            color === 'primary' && 'bg-primary',
            color === 'blue' && 'bg-blue-500',
            !['green', 'red', 'amber', 'primary', 'blue'].includes(color) && 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  );
}
