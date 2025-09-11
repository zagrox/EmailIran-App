
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
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
            {currentStep > step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-brand-purple" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple"
                >
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              </>
            ) : currentStep === step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-purple bg-slate-50 dark:bg-slate-800"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
              </>
            )}
             <span className="absolute top-10 w-max -ml-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">{step.title}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;