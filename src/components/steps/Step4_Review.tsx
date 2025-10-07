

import React, { useMemo, useState } from 'react';
import type { CampaignState, AudienceCategory, PricingTier } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../IconComponents';

interface Props {
  campaignData: CampaignState;
  audienceCategories: AudienceCategory[];
  pricingTiers: PricingTier[];
  onFinalizePayment: (paymentMethod: 'online' | 'offline') => void;
  isProcessingPayment: boolean;
}

const SummaryItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <h4 className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</h4>
        <div className="mt-1 text-slate-800 dark:text-slate-200">{children}</div>
    </div>
);

const ZibalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="none" fillRule="evenodd">
            <path d="M0 0h256v256H0z" />
            <path fill="#293036" d="M128 256c70.692 0 128-57.308 128-128C256 57.308 198.692 0 128 0 57.308 0 0 57.308 0 128c0 70.692 57.308 128 128 128z" />
            <path fill="#FFF" d="M112.559 180.825l18.577-44.464c1.157-2.776.434-5.986-1.83-7.838l-40.06-32.048c-3.15-2.52-7.595-1.99-10.115 1.16L53.75 125.41c-2.52 3.15-1.99 7.595 1.16 10.115l51.533 41.226c3.15 2.52 7.595 1.99 10.115-1.16.88-.112 1.39-.33 2.15-1.05 1.5-1.5 1.7-3.6.4-5.716zm25.922-92.417c-1.135-2.724-.31-5.986 2.01-7.838l14.4-11.52c3.15-2.52 7.595-1.99 10.115 1.16l25.38 31.725c2.52 3.15 1.99 7.595-1.16 10.115l-40.06 32.048c-2.264 1.852-5.432 2.513-8.15.93-2.72-1.58-4.22-4.5-3.53-7.53zm-2.264-16.12c-2.52-3.15-1.99-7.595 1.16-10.115L158.4 43.14c3.15-2.52 7.595-1.99 10.115 1.16l14.4 18c2.52 3.15 1.99 7.595-1.16 10.115l-21.03 16.824c-3.15 2.52-7.595 1.99-10.115-1.16l-14.4-18z" />
        </g>
    </svg>
);

const Step4Review: React.FC<Props> = ({ campaignData, audienceCategories, pricingTiers, onFinalizePayment, isProcessingPayment }) => {
    const { audience, message, schedule } = campaignData;
    const { isAuthenticated } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online');

    const selectedCategories = audienceCategories.filter(c => audience.categoryIds.includes(c.id));
    const recipientCount = selectedCategories.reduce((sum, c) => sum + c.count, 0);
    const segmentNames = selectedCategories.map(c => c.name_fa).join('، ') || 'مخاطب انتخاب نشده';
    
    const { pricePerEmail, totalCost, tierName } = useMemo(() => {
        if (!pricingTiers || pricingTiers.length === 0 || recipientCount === 0) {
            return { pricePerEmail: 0, totalCost: 0, tierName: '-' };
        }
        
        const applicableTier = [...pricingTiers].reverse().find(tier => recipientCount >= tier.pricing_volume);
        const effectiveTier = applicableTier || pricingTiers[0];

        const rate = effectiveTier.pricing_rate;
        const cost = recipientCount * rate;
        return { pricePerEmail: rate, totalCost: cost, tierName: effectiveTier.pricing_level };
    }, [recipientCount, pricingTiers]);

    const buttonText = !isAuthenticated ? 'ورود و پرداخت' : (paymentMethod === 'online' ? 'پرداخت آنلاین' : 'ثبت سفارش');

    return (
        <div className="animate-slide-in-up">
            <h2 className="h2">{isAuthenticated ? 'تایید و پرداخت' : 'بررسی و ورود'}</h2>
            <p className="p-description">
                {isAuthenticated
                    ? 'جزئیات کمپین خود را بررسی کنید، روش پرداخت را انتخاب کرده و برای ارسال آماده شوید.'
                    : 'جزئیات کمپین خود را بررسی کنید. برای تکمیل و ارسال باید وارد شوید.'
                }
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaign Details */}
                <div className="card lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">خلاصه کمپین</h3>
                    
                    <SummaryItem label="مخاطبان">
                        <p>بخش ها: <span className="font-semibold">{segmentNames}</span></p>
                        <p>مجموع گیرندگان تخمینی: <span className="font-semibold">{recipientCount.toLocaleString('fa-IR')}</span></p>
                    </SummaryItem>
                    
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    <SummaryItem label="پیام">
                        <p className="font-semibold">موضوع: "{message.subject}"</p>
                        {message.contentType === 'editor' ? (
                            <div className="mt-2 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800 max-h-40 overflow-y-auto">
                                <p className="text-base whitespace-pre-wrap">{message.body}</p>
                            </div>
                        ) : (
                             <div className="mt-2 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800">
                                <p className="text-base font-semibold">قالب HTML سفارشی آپلود شده است.</p>
                            </div>
                        )}
                    </SummaryItem>

                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    <SummaryItem label="زمان‌بندی">
                        <p>تاریخ ارسال: <span className="font-semibold">{new Date(schedule.sendDate + 'T00:00:00').toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} در ساعت {schedule.sendTime}</span></p>
                        <p>تحویل آگاه از منطقه زمانی: <span className={`font-semibold ${schedule.timezoneAware ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{schedule.timezoneAware ? 'فعال' : 'غیرفعال'}</span></p>
                    </SummaryItem>
                    
                    {message.abTest.enabled && (
                        <>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <SummaryItem label="آزمون A/B">
                                <p>آزمون فعال است: <span className="font-semibold text-green-500 dark:text-green-400">بله</span></p>
                                <p>موضوع ب: <span className="font-semibold">"{message.abTest.subjectB}"</span></p>
                                <p>اندازه گروه آزمون: <span className="font-semibold">{message.abTest.testSize}% از مخاطبان</span></p>
                            </SummaryItem>
                        </>
                    )}
                </div>

                {/* Pricing and Payment */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">روش پرداخت</h3>
                        <div className="space-y-3">
                            <button onClick={() => setPaymentMethod('online')} className={`w-full p-4 rounded-lg border-2 text-right transition-all duration-200 flex items-center justify-between ${paymentMethod === 'online' ? 'card-category-selected' : 'card-category-unselected'}`}>
                                <span className="font-semibold text-slate-800 dark:text-white">پرداخت آنلاین</span>
                                <ZibalIcon className="w-12 h-auto" />
                            </button>
                             <button onClick={() => setPaymentMethod('offline')} className={`w-full p-4 rounded-lg border-2 text-right transition-all duration-200 flex items-center justify-between ${paymentMethod === 'offline' ? 'card-category-selected' : 'card-category-unselected'}`}>
                                <span className="font-semibold text-slate-800 dark:text-white">کارت به کارت / حواله بانکی</span>
                            </button>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">خلاصه هزینه</h3>
                        <div className="space-y-3 text-slate-600 dark:text-slate-300">
                           <div className="flex justify-between">
                               <span>گیرندگان</span>
                               <span>{recipientCount.toLocaleString('fa-IR')}</span>
                           </div>
                           <div className="flex justify-between">
                               <span>قیمت هر ایمیل</span>
                               <span className="font-semibold">{pricePerEmail.toLocaleString('fa-IR')} تومان</span>
                           </div>
                           <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                <span>سطح قیمت‌گذاری</span>
                                <span className="capitalize">{tierName}</span>
                            </div>
                           <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                           <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg">
                               <span>هزینه کل</span>
                               <span>{totalCost.toLocaleString('fa-IR')} تومان</span>
                           </div>
                        </div>
                    </div>
                     <button 
                        onClick={() => onFinalizePayment(paymentMethod)}
                        disabled={isProcessingPayment || totalCost <= 0}
                        className="btn btn-gradient w-full !text-lg !py-3"
                     >
                        {isProcessingPayment ? <LoadingSpinner className="w-6 h-6" /> : buttonText}
                     </button>
                </div>
            </div>
        </div>
    );
};

export default Step4Review;
