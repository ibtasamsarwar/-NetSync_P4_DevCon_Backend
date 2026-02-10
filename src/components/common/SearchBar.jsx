import { clsx } from 'clsx';

export default function SearchBar({ value, onChange, placeholder = 'Search...', icon = 'search', className }) {
  return (
    <div className={clsx('relative', className)}>
      <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
        {icon}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
      />
    </div>
  );
}
