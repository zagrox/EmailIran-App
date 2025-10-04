import React from 'react';

interface Step {
  id: number;
  title: string;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm w-full rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 mb-8 p-6">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => {
            const isPast = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
                {/* Connector line */}
                {stepIdx > 0 && (
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${isPast || isCurrent ? 'bg-brand-purple' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  </div>
                )}
                
                <div className="relative flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 bg-slate-50 dark:bg-slate-800
                      ${isCurrent ? 'border-2 border-brand-purple' : 'border-2 border-slate-300 dark:border-slate-600'}
                    `}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCurrent && (
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" aria-hidden="true" />
                    )}
                  </div>

                  {/* Title */}
                  <span className={`mt-3 block w-max text-center text-base font-medium 
                    ${isCurrent ? 'text-brand-purple dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Stepper;