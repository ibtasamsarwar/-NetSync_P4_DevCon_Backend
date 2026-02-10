import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/30',
  secondary: 'bg-white text-charcoal border border-gray-200 hover:bg-gray-50',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'text-charcoal hover:bg-gray-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className,
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="material-icons animate-spin text-[18px]">refresh</span>
      )}
      {!loading && icon && (
        <span className="material-icons text-[18px]">{icon}</span>
      )}
      {children}
      {iconRight && (
        <span className="material-icons text-[18px]">{iconRight}</span>
      )}
    </button>
  );
}
