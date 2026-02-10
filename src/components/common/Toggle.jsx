import { clsx } from 'clsx';

export default function Toggle({ checked, onChange, label, description, className }) {
  return (
    <label className={clsx('flex items-center justify-between cursor-pointer', className)}>
      <div>
        {label && <span className="text-sm font-medium text-charcoal">{label}</span>}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-checked:bg-primary rounded-full transition-colors duration-200" />
        <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
