

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCampaignById } from '../services/campaignService';
import type { EmailMarketingCampaign, CampaignStatus } from '../types';
import { CAMPAIGN_STATUS_INFO } from '../constants';
// FIX: Imported ClockIcon to resolve an undefined component error.
import { LoadingSpinner, MailIcon, UserIcon, UsersIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, LinkIcon, SparklesIcon, ClockIcon } from './IconComponents';
import CampaignStatusStepper from './CampaignStatusStepper';

interface Props {
    campaignId: number;
    onBack: () => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-6 h-6 text-slate-500 dark:text-slate-400 mt-1">{icon}</div>
        <div>
            <h4 className="text-base font-semibold text-slate-500 dark:text-slate-400">{label}</h4>
            <div className="text-lg text-slate-800 dark:text-slate-200">{children}</div>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
    const statusInfo = CAMPAIGN_STATUS_INFO[status] || CAMPAIGN_STATUS_INFO.scheduled;
    const Icon = statusInfo.icon;
    const animationClass = status === 'sending' ? 'animate-pulse' : '';
    return (
        <div className={`inline-flex items-center gap-2 text-base font-semibold px-3 py-1 rounded-full ${statusInfo.colorClasses} ${animationClass}`}>
            <Icon className="w-5 h-5" />
            <span>{statusInfo.label}</span>
        </div>
    );
};

const CampaignDetailsPage: React.FC<Props> = ({ campaignId, onBack }) => {
    const [campaign, setCampaign] = useState<EmailMarketingCampaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { accessToken } = useAuth();

    useEffect(() => {
        if (!accessToken) {
            setError("Authentication token is missing.");
            setIsLoading(false);
            return;
        }

        const loadCampaign = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchCampaignById(campaignId, accessToken);
                setCampaign(data);
            } catch (err) {
                setError("Failed to load campaign details.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadCampaign();
    }, [campaignId, accessToken]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-40">
                <LoadingSpinner className="w-16 h-16 text-brand-purple" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 card">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">خطا در بارگذاری کمپین</h3>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{error}</p>
                <button onClick={onBack} className="btn btn-primary mt-6">
                    بازگشت به لیست
                </button>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-20 card">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">کمپین یافت نشد</h3>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400">ممکن است این کمپین حذف شده باشد.</p>
                <button onClick={onBack} className="btn btn-primary mt-6">
                    بازگشت به لیست
                </button>
            </div>
        );
    }

    const campaignDate = new Date(campaign.campaign_date);
    const formattedDate = campaignDate.toLocaleDateString('fa-IR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = campaignDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
                <div className="flex-grow">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">{campaign.campaign_subject}</h1>
                    <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                        جزئیات و محتوای کمپین ارسال شده شما.
                    </p>
                </div>
                <button onClick={onBack} className="btn btn-secondary flex-shrink-0">
                    &rarr; بازگشت به کمپین‌ها
                </button>
            </div>

            <div className="mb-12">
                <CampaignStatusStepper currentStatus={campaign.campaign_status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Email Preview */}
                <div className="lg:col-span-2 card">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-4 flex items-center gap-2">
                        <MailIcon className="w-6 h-6 text-brand-mint" />
                        پیش‌نمایش محتوا
                    </h3>
                    <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-inner p-6 border border-slate-200 dark:border-slate-700 min-h-[300px]">
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                            {campaign.campaign_content}
                        </p>
                    </div>
                </div>

                {/* Right Panel: Details */}
                <div className="card h-fit">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-6">جزئیات</h3>
                    <div className="space-y-6">
                        <DetailItem icon={<UserIcon />} label="فرستنده">
                            <span className="font-semibold">{campaign.campaign_sender}</span>
                        </DetailItem>
                        <DetailItem icon={<CalendarDaysIcon />} label="زمان ارسال">
                            <span className="font-semibold">{formattedDate} - ساعت {formattedTime}</span>
                        </DetailItem>
                        {campaign.campaign_audiences && campaign.campaign_audiences.length > 0 && (
                            <DetailItem icon={<UsersIcon />} label="مخاطبان هدف">
                                <ul className="list-disc list-inside space-y-1">
                                    {campaign.campaign_audiences.map(rel => {
                                        const audience = rel.audiences_id;
                                        // FIX: Added a type guard to satisfy TypeScript. When reading campaign details, `audience` will always be an object, but this ensures type safety.
                                        if (typeof audience === 'object' && audience !== null) {
                                            return (
                                                <li key={audience.id} className="font-semibold">
                                                    {audience.audience_title}
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                </ul>
                            </DetailItem>
                        )}
                        <DetailItem icon={<ClockIcon />} label="وضعیت">
                           <StatusBadge status={campaign.campaign_status} />
                        </DetailItem>
                        <DetailItem icon={<SparklesIcon />} label="آزمون A/B">
                            {campaign.campaign_ab ? (
                                <div className="space-y-1">
                                    <p className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> فعال</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">موضوع ب: "{campaign.campaign_subject_b}"</p>
                                </div>
                            ) : (
                                <p className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-2"><XCircleIcon className="w-5 h-5"/> غیرفعال</p>
                            )}
                        </DetailItem>
                        {campaign.campaign_link && (
                             <DetailItem icon={<LinkIcon />} label="لینک خارجی">
                                <a 
                                    href={campaign.campaign_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-semibold text-brand-purple hover:underline"
                                >
                                    مشاهده کمپین
                                </a>
                            </DetailItem>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailsPage;