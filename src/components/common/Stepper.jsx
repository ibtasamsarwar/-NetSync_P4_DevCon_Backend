import { clsx } from 'clsx';

export default function Stepper({ steps, currentStep, className }) {
  return (
    <div className={clsx('flex items-center', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  isCompleted && 'bg-primary text-white',
                  isActive && 'bg-primary text-white ring-4 ring-primary/20',
                  !isCompleted && !isActive && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <span className="material-icons text-[16px]">check</span>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={clsx(
                  'text-xs mt-1.5 font-medium',
                  isActive ? 'text-primary' : isCompleted ? 'text-charcoal' : 'text-gray-400'
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={clsx(
                  'w-16 h-0.5 mx-2',
                  isCompleted ? 'bg-primary' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
