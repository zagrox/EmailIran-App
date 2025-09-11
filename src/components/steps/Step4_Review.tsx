

import React from 'react';
import type { CampaignState } from '../../types';

interface Props {
  campaignData: CampaignState;
}

const SummaryItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</h4>
        <div className="mt-1 text-slate-800 dark:text-slate-200">{children}</div>
    </div>
);

const Step4Review: React.FC<Props> = ({ campaignData }) => {
    const { audience, message, schedule } = campaignData;
    const recipientCount = 12540; // Mocked from Step 1
    const pricePerEmail = 0.001;
    const totalCost = recipientCount * pricePerEmail;

    return (
        <div className="animate-slide-in-up">
            <h2 className="h2">تایید نهایی</h2>
            <p className="p-description">جزئیات کمپین خود را بررسی کنید، قیمت‌گذاری شفاف را ببینید و برای ارسال آماده شوید.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaign Details */}
                <div className="card lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">خلاصه کمپین</h3>
                    
                    <SummaryItem label="مخاطبان">
                        <p>بخش: <span className="font-semibold">مشترکین فعال</span></p>
                        <p>گیرندگان تخمینی: <span className="font-semibold">{recipientCount.toLocaleString('fa-IR')}</span></p>
                    </SummaryItem>
                    
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>

                    <SummaryItem label="پیام">
                        <p className="font-semibold">موضوع: "{message.subject}"</p>
                        <div className="mt-2 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800 max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        </div>
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
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">قیمت‌گذاری</h3>
                        <div className="space-y-3 text-slate-600 dark:text-slate-300">
                           <div className="flex justify-between">
                               <span>گیرندگان</span>
                               <span>{recipientCount.toLocaleString('fa-IR')}</span>
                           </div>
                           <div className="flex justify-between">
                               <span>قیمت هر ایمیل</span>
                               <span>${pricePerEmail.toFixed(4)}</span>
                           </div>
                           <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                           <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg">
                               <span>هزینه کل</span>
                               <span>${totalCost.toFixed(2)}</span>
                           </div>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">روش پرداخت</h3>
                        <div className="flex items-center gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
                            <svg className="h-8 w-8 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 48 48">
                                <path fill="currentColor" fillRule="evenodd" d="M5 10a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v28a3 3 0 0 1-3-3H8a3 3 0 0 1-3-3V10Zm3 0h32v6H8v-6Zm0 10v15h32V20H8Z" clipRule="evenodd"></path>
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">ویزا با پایان ۱۲۳۴</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">انقضا ۱۲/۲۰۲۵</p>
                            </div>
                        </div>
                        <button className="text-sm text-brand-mint hover:opacity-80 mt-3">تغییر روش پرداخت</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step4Review;