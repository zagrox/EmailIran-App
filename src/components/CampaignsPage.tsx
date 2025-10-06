import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { fetchCampaigns } from '../services/campaignService';
import type { EmailMarketingCampaign, CampaignStatus } from '../types';
import { LoadingSpinner, UserIcon, CalendarDaysIcon, SparklesIcon, MailIcon, PencilIcon, ClockIcon, CreditCardIcon, EllipsisHorizontalIcon, PaperAirplaneIcon, ChartBarIcon } from './IconComponents';
import { CAMPAIGN_STATUS_INFO, CAMPAIGN_STATUS_ORDER } from '../constants';
import PageHeader from './PageHeader';

const ActionBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
    const statusInfoMap = {
        editing: { label: 'ویرایش کمپین', icon: PencilIcon, classes: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
        scheduled: { label: 'زمانبندی شده', icon: ClockIcon, classes: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' },
        payment: { label: 'ثبت و پرداخت', icon: CreditCardIcon, classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        processing: { label: 'در صف ارسال', icon: EllipsisHorizontalIcon, classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
        sending: { label: 'در حال ارسال', icon: PaperAirplaneIcon, classes: 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300' },
        completed: { label: 'مشاهده گزارش', icon: ChartBarIcon, classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
    };

    const info = statusInfoMap[status] || statusInfoMap.scheduled;
    const Icon = info.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full ${info.classes}`}>
            <Icon className="w-4 h-4" />
            <span>{info.label}</span>
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
    const statusInfo = CAMPAIGN_STATUS_INFO[campaign.campaign_status];

    return (
        <button 
            onClick={() => onViewCampaign(campaign.id)}
            className="card-report !p-0 overflow-hidden relative text-right w-full transition-all duration-300 hover:shadow-xl hover:ring-brand-500/50 dark:hover:ring-brand-500 cursor-pointer"
        >
            <div 
                className={`w-2 h-full absolute right-0 top-0`} 
                style={{ backgroundColor: campaign.campaign_color || (statusInfo ? statusInfo.color : '#0d9488') }}
            ></div>
            <div className="p-5 pr-6 w-full">
                <div className="flex flex-col sm:flex-row items-center w-full gap-4">
                    <div className="flex-grow text-right w-full">
                         <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{campaign.campaign_subject}</h3>
                            {campaign.campaign_ab && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-slate-800 dark:text-white border border-brand-500">
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
                        <ActionBadge status={campaign.campaign_status} />
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
    const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all');

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

    const filteredCampaigns = campaigns.filter(campaign => {
        if (selectedStatus === 'all') return true;
        return campaign.campaign_status === selectedStatus;
    });

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
            <PageHeader
                title="کمپین‌های شما"
                description="کمپین‌های ایمیل برنامه‌ریزی شده و ارسال شده خود را مدیریت کنید."
            >
                <button onClick={onStartNewCampaign} className="btn btn-ai flex-shrink-0">
                    <SparklesIcon className="w-5 h-5"/>
                    <span>ساخت کمپین جدید</span>
                </button>
            </PageHeader>
            
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400 mr-2">فیلتر بر اساس وضعیت:</h3>
                <button
                    onClick={() => setSelectedStatus('all')}
                    className={`btn-filter ${selectedStatus === 'all' ? 'btn-filter-selected' : 'btn-filter-unselected'}`}
                >
                    همه
                </button>
                {CAMPAIGN_STATUS_ORDER.map(status => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`btn-filter ${selectedStatus === status ? 'btn-filter-selected' : 'btn-filter-unselected'}`}
                    >
                        {CAMPAIGN_STATUS_INFO[status].label}
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner className="w-12 h-12 text-brand-600" />
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
                <>
                    {filteredCampaigns.length > 0 ? (
                        <div className="space-y-6">
                            {filteredCampaigns.sort((a, b) => new Date(b.campaign_date).getTime() - new Date(a.campaign_date).getTime()).map(campaign => (
                                <CampaignCard key={campaign.id} campaign={campaign} onViewCampaign={onViewCampaign} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-20 card">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">هیچ کمپینی با این وضعیت یافت نشد.</h3>
                            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">یک فیلتر دیگر را امتحان کنید.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CampaignsPage;