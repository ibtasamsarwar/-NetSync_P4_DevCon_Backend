import { clsx } from 'clsx';

export default function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={clsx('flex gap-1 p-1 bg-gray-100 rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            activeTab === tab.value
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-gray-500 hover:text-charcoal'
          )}
        >
          {tab.icon && (
            <span className="material-icons text-[16px] mr-1.5 align-middle">{tab.icon}</span>
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
