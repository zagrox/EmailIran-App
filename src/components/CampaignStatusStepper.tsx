import React from 'react';
import type { CampaignStatus } from '../types';
import { CAMPAIGN_STATUS_INFO, CAMPAIGN_STATUS_ORDER } from '../constants';

interface Props {
  currentStatus: CampaignStatus;
}

const CampaignStatusStepper: React.FC<Props> = ({ currentStatus }) => {
  const currentIndex = CAMPAIGN_STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-6 sm:p-8">
      <nav aria-label="Campaign Progress">
        <ol role="list" className="flex items-start">
          {CAMPAIGN_STATUS_ORDER.map((status, index) => {
            const statusInfo = CAMPAIGN_STATUS_INFO[status];
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;
            const isFirst = index === 0;
            const isLast = index === CAMPAIGN_STATUS_ORDER.length - 1;

            return (
              <li key={status} className="relative text-center flex-1">
                {/* Connector Lines */}
                {/* Line before dot (right half of li, connects to previous item in RTL) */}
                {!isFirst && (
                  <div
                    className={`absolute w-1/2 h-0.5 top-4 left-1/2 ${
                      isCompleted || isCurrent ? 'bg-brand-purple' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-hidden="true"
                  />
                )}
                {/* Line after dot (left half of li, connects to next item in RTL) */}
                {!isLast && (
                  <div
                    className={`absolute w-1/2 h-0.5 top-4 right-1/2 ${
                      isCompleted ? 'bg-brand-purple' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex flex-col items-center">
                  {/* The dot */}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full z-10
                      ${isCompleted ? 'bg-brand-purple' : ''}
                      ${isCurrent ? 'border-2 border-brand-purple bg-slate-50 dark:bg-slate-800' : ''}
                      ${isUpcoming ? 'border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800' : ''}
                    `}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted && (
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isCurrent && (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" aria-hidden="true" />
                        {status === 'sending' && (
                          <span className="absolute h-full w-full animate-ping rounded-full bg-brand-purple opacity-75" />
                        )}
                      </>
                    )}
                    {isUpcoming && (
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                    )}
                  </div>

                  {/* The label */}
                  <span
                    className={`mt-2 block max-w-20 text-center text-sm sm:text-base font-medium ${
                      isCompleted || isCurrent ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {statusInfo.label}
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

export default CampaignStatusStepper;