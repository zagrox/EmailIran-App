

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { fetchCampaigns } from '../services/campaignService';
import type { EmailMarketingCampaign, CampaignStatus } from '../types';
import { LoadingSpinner, UserIcon, CalendarDaysIcon, SparklesIcon, MailIcon } from './IconComponents';
import { CAMPAIGN_STATUS_INFO } from '../constants';

const StatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
    const statusInfo = CAMPAIGN_STATUS_INFO[status] || CAMPAIGN_STATUS_INFO.scheduled;
    const Icon = statusInfo.icon;
    const animationClass = status === 'sending' ? 'animate-pulse' : '';
    return (
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.colorClasses} ${animationClass}`}>
            <Icon className="w-4 h-4" />
            <span>{statusInfo.label}</span>
        </div>
    );
};

interface CampaignCardProps {
    campaign: EmailMarketingCampaign;
    onViewCampaign: (id: number) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onViewCampaign }) => {
    const campaignDate = new Date(campaign.campaign_date);
    const formattedDate = campaignDate.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = campaignDate.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <button 
            onClick={() => onViewCampaign(campaign.id)}
            className="card-report !p-0 overflow-hidden relative text-right w-full transition-all duration-300 hover:shadow-xl hover:ring-brand-purple/50 dark:hover:ring-brand-purple cursor-pointer"
        >
            <div className={`w-2 h-full absolute right-0 top-0`} style={{ backgroundColor: campaign.campaign_color || '#6D28D9' }}></div>
            <div className="p-5 pr-6 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                    <div className="flex-grow">
                         <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{campaign.campaign_subject}</h3>
                            <StatusBadge status={campaign.campaign_status} />
                            {campaign.campaign_ab && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-mint/20 text-slate-800 dark:text-white border border-brand-mint">
                                    A/B
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-base text-slate-500 dark:text-slate-400 mt-2">
                            <p className="flex items-center gap-2">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>{formattedDate} - ساعت {formattedTime}</span>
                            </p>
                            {campaign.campaign_sender && (
                                <p className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    <span>فرستنده: {campaign.campaign_sender}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex-shrink-0 z-10">
                        {campaign.campaign_link ? (
                             <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    window.open(campaign.campaign_link, '_blank', 'noopener,noreferrer');
                                }}
                                className="btn btn-secondary !px-4 !py-1.5"
                            >
                                مشاهده
                            </button>
                        ) : (
                            <span className="text-sm px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">ارسال شده</span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};


interface CampaignsPageProps {
    onStartNewCampaign: () => void;
    onViewCampaign: (id: number) => void;
}

const CampaignsPage: React.FC<CampaignsPageProps> = ({ onStartNewCampaign, onViewCampaign }) => {
    const { isAuthenticated, accessToken } = useAuth();
    const { navigateToLogin } = useUI();
    const [campaigns, setCampaigns] = useState<EmailMarketingCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            const loadCampaigns = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await fetchCampaigns(accessToken);
                    setCampaigns(data);
                } catch (err) {
                    setError('خطا در دریافت لیست کمپین‌ها.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            loadCampaigns();
        } else if (!isAuthenticated) {
            setIsLoading(false);
        }
    }, [isAuthenticated, accessToken]);

    if (!isAuthenticated && !isLoading) {
         return (
            <div className="text-center py-20 animate-fade-in">
                <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 mb-6">
                    <MailIcon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">وارد شوید تا کمپین‌های خود را ببینید</h2>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">برای مشاهده و مدیریت کمپین‌های خود، لطفاً وارد شوید.</p>
                <button onClick={navigateToLogin} className="btn btn-primary mt-8">
                    ورود به حساب کاربری
                </button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">کمپین‌های شما</h1>
                    <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                        کمپین‌های ایمیل برنامه‌ریزی شده و ارسال شده خود را مدیریت کنید.
                    </p>
                </div>
                <button onClick={onStartNewCampaign} className="btn btn-ai flex-shrink-0">
                    <SparklesIcon className="w-5 h-5"/>
                    <span>ساخت کمپین جدید</span>
                </button>
            </div>
            
            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner className="w-12 h-12 text-brand-purple" />
                </div>
            )}
            {error && (
                 <div className="text-center py-20">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
            )}
            {!isLoading && !error && campaigns.length === 0 && (
                 <div className="text-center py-20 card">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">هنوز کمپینی نساخته‌اید!</h3>
                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">بیایید اولین کمپین خود را با کمک دستیار هوش مصنوعی بسازیم.</p>
                    <button onClick={onStartNewCampaign} className="btn btn-primary mt-6">
                        ساخت اولین کمپین
                    </button>
                </div>
            )}
            {!isLoading && !error && campaigns.length > 0 && (
                <div className="space-y-6">
                    {campaigns.sort((a,b) => new Date(b.campaign_date).getTime() - new Date(a.campaign_date).getTime()).map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} onViewCampaign={onViewCampaign} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignsPage;