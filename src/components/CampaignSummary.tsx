import React, { useMemo } from 'react';
import type { CampaignState, AudienceCategory, PricingTier, CampaignStatus } from '../types';
import { UsersIcon, MailIcon, ClockIcon, CreditCardIcon, TagIcon, XIcon } from './IconComponents';
import { CAMPAIGN_STATUS_INFO } from '../constants';

interface Props {
  status: CampaignStatus;
  campaignData: CampaignState;
  audienceCategories: AudienceCategory[];
  pricingTiers: PricingTier[];
  isOpen: boolean;
  onClose: () => void;
}

const SummaryItem: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div>
        <h4 className="flex items-center gap-2 text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {icon}
            <span>{label}</span>
        </h4>
        <div className="mt-1 pl-7 text-slate-800 dark:text-slate-200">{children}</div>
    </div>
);

const CampaignSummary: React.FC<Props> = ({ status, campaignData, audienceCategories, pricingTiers, isOpen, onClose }) => {
    const { totalRecipients, estimatedCost } = useMemo(() => {
        const selectedCategories = audienceCategories.filter(c => campaignData.audience.categoryIds.includes(c.id));
        const recipients = selectedCategories.reduce((sum, c) => sum + c.count, 0);

        if (!pricingTiers || pricingTiers.length === 0 || recipients === 0) {
            return { totalRecipients: recipients, estimatedCost: 0 };
        }
        
        const applicableTier = [...pricingTiers].reverse().find(tier => recipients >= tier.pricing_volume);
        const effectiveTier = applicableTier || pricingTiers[0];
        const cost = recipients * (effectiveTier?.pricing_rate || 0);

        return { totalRecipients: recipients, estimatedCost: cost };
    }, [campaignData.audience.categoryIds, audienceCategories, pricingTiers]);
    
    const selectedAudienceNames = useMemo(() => {
        return audienceCategories
            .filter(c => campaignData.audience.categoryIds.includes(c.id))
            .map(c => c.name_fa)
            .join('، ');
    }, [campaignData.audience.categoryIds, audienceCategories]);

    const statusInfo = CAMPAIGN_STATUS_INFO[status];

    return (
        <>
            <div
                className={`drawer-overlay ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            ></div>
            <div
                className={`drawer-container ${isOpen ? 'drawer-open' : 'drawer-closed'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="summary-title"
            >
                <div className="flex flex-col h-full">
                     <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                         <h3 id="summary-title" className="text-xl font-bold text-slate-900 dark:text-white">خلاصه کمپین</h3>
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>
                    <div className="p-6 space-y-5 overflow-y-auto flex-grow">
                        <SummaryItem icon={<TagIcon className="w-5 h-5"/>} label="وضعیت فعلی">
                            <p className={`font-semibold`} style={{ color: statusInfo.color }}>{statusInfo.label}</p>
                        </SummaryItem>
                        
                        <SummaryItem icon={<MailIcon className="w-5 h-5"/>} label="موضوع اصلی">
                            <p className="font-semibold truncate">{campaignData.message.subject || <span className="text-slate-400">هنوز تعیین نشده</span>}</p>
                        </SummaryItem>
                        
                        <SummaryItem icon={<UsersIcon className="w-5 h-5"/>} label="مخاطبان">
                            {totalRecipients > 0 ? (
                                <>
                                    <p className="font-semibold">{selectedAudienceNames}</p>
                                    <p className="text-sm text-slate-500">{totalRecipients.toLocaleString('fa-IR')} مشترک</p>
                                </>
                            ) : (
                                <p className="text-slate-400">انتخاب نشده</p>
                            )}
                        </SummaryItem>

                        <SummaryItem icon={<ClockIcon className="w-5 h-5"/>} label="زمانبندی">
                            {campaignData.schedule.sendDate ? (
                                <p className="font-semibold">
                                    {new Date(campaignData.schedule.sendDate + 'T00:00:00').toLocaleDateString('fa-IR', { day: 'numeric', month: 'long' })}، ساعت {campaignData.schedule.sendTime}
                                </p>
                            ) : (
                                <p className="text-slate-400">هنوز تعیین نشده</p>
                            )}
                        </SummaryItem>
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 !mt-4 !mb-4"></div>

                        <SummaryItem icon={<CreditCardIcon className="w-5 h-5"/>} label="هزینه تخمینی">
                            <p className="font-bold text-2xl text-brand-600 dark:text-brand-400">
                                {estimatedCost > 0 ? `${estimatedCost.toLocaleString('fa-IR')} تومان` : <span className="text-slate-400 text-lg">--</span>}
                            </p>
                        </SummaryItem>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CampaignSummary;