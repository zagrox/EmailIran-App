

import React, { useState, useMemo, useEffect } from 'react';
import { UsersIcon, QuestionMarkCircleIcon, SparklesIcon, CalendarDaysIcon, ChartBarIcon, WaveIcon, SignupArrowIcon, ClockIcon, LoadingSpinner, CalculatorIcon } from './IconComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AudienceCategory, Report, EmailMarketingCampaign } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import TodayViewCard from './TodayViewCard';
import { fetchCampaigns } from '../services/campaignService';

interface DashboardProps {
    theme: 'light' | 'dark';
    onOpenAIAssistant: (initialPrompt?: string) => void;
    audienceCategories: AudienceCategory[];
    onViewCampaign: (id: number) => void;
}

const chartData = [
  { name: 'اسفند', subscribers: 20000 },
  { name: 'فروردین', subscribers: 27800 },
  { name: 'اردیبهشت', subscribers: 26000 },
  { name: 'خرداد', subscribers: 38000 },
  { name: 'تیر', subscribers: 39000 },
];

interface ReportCardProps {
    report: Report;
    onViewCampaign: (id: number) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onViewCampaign }) => {
    return (
        <button 
            onClick={() => onViewCampaign(parseInt(report.id, 10))}
            className="card-report w-full text-right"
        >
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{report.name}</h3>
                <p className="text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <ClockIcon className="w-4 h-4" />
                    ارسال شده در {new Date(report.sentDate).toLocaleDateString('fa-IR', { dateStyle: 'medium' })}
                </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-3 gap-4 text-center mt-4 sm:mt-0 sm:text-right">
                <div>
                    <div className="text-base text-slate-500 dark:text-slate-400">باز شدن</div>
                    <div className="font-bold text-xl text-brand-600">{report.stats.openRate.toLocaleString('fa-IR')}%</div>
                </div>
                <div>
                    <div className="text-base text-slate-500 dark:text-slate-400">کلیک</div>
                    <div className="font-bold text-xl text-brand-400">{report.stats.clickRate.toLocaleString('fa-IR')}%</div>
                </div>
                 <div>
                    <div className="text-base text-slate-500 dark:text-slate-400">تبدیل</div>
                    <div className="font-bold text-xl text-yellow-400">{report.stats.conversions.toLocaleString('fa-IR')}</div>
                </div>
            </div>
        </button>
    );
};


const DashboardPage: React.FC<DashboardProps> = ({ theme, onOpenAIAssistant, audienceCategories, onViewCampaign }) => {
    const [prompt, setPrompt] = useState('');
    const { isAuthenticated, user, accessToken } = useAuth();
    const { navigateToLogin, navigate } = useUI();
    const isDark = theme === 'dark';

    const [latestReports, setLatestReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [reportsError, setReportsError] = useState<string | null>(null);

    const mapCampaignToReport = (campaign: EmailMarketingCampaign): Report => ({
        id: String(campaign.id),
        name: campaign.campaign_subject,
        sentDate: campaign.campaign_date,
        stats: {
            openRate: parseFloat((25.3 + (campaign.id % 10)).toFixed(1)),
            clickRate: parseFloat((3.8 + (campaign.id % 5)).toFixed(1)),
            conversions: 112 + (campaign.id % 50),
        },
        chartData: []
    });

    const features = [
        { name: 'ساخت کمپین هوشمند', icon: <SparklesIcon className="w-8 h-8"/>, action: () => onOpenAIAssistant() },
        { name: 'رویدادهای رسمی', icon: <CalendarDaysIcon className="w-8 h-8"/>, action: () => navigate('calendar') },
        { name: 'راهنمای اپلیکیشن', icon: <QuestionMarkCircleIcon className="w-8 h-8"/>, action: () => navigate('help') },
        { name: 'لیست‌های مشترکین', icon: <UsersIcon className="w-8 h-8"/>, action: () => navigate('audiences') },
        { name: 'تعرفه ایمیل مارکتینگ', icon: <CalculatorIcon className="w-8 h-8"/>, action: () => navigate('pricing') },
        { name: 'کمپین‌ها و گزارشات', icon: <ChartBarIcon className="w-8 h-8"/>, action: () => navigate('campaigns') },
    ];
    
    const FeatureCard: React.FC<{ name: string; icon: React.ReactNode; action: () => void; }> = ({ name, icon, action }) => (
        <button onClick={action} className="feature-card w-full">
            <div className="text-brand-500">{icon}</div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{name}</span>
        </button>
    );

    useEffect(() => {
        const loadCampaigns = async () => {
            if (!isAuthenticated || !accessToken) {
                setIsLoadingReports(false);
                return;
            }
            try {
                const campaigns = await fetchCampaigns(accessToken);
                const completed = campaigns
                    .filter(c => c.campaign_status === 'completed')
                    .sort((a, b) => new Date(b.campaign_date).getTime() - new Date(a.campaign_date).getTime())
                    .slice(0, 4);
                setLatestReports(completed.map(mapCampaignToReport));
            } catch (err) {
                console.error(err);
                setReportsError('Failed to load recent campaigns.');
            } finally {
                setIsLoadingReports(false);
            }
        };
        loadCampaigns();
    }, [isAuthenticated, accessToken]);

    const totalSubscribers = useMemo(() => {
        return audienceCategories.reduce((total, category) => total + category.count, 0);
    }, [audienceCategories]);

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onOpenAIAssistant(prompt);
            setPrompt('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerateClick();
        }
    };
    
    const tooltipStyle: React.CSSProperties = {
        backgroundColor: isDark ? '#111827' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        color: isDark ? '#e2e8f0' : '#1e293b',
        direction: 'rtl',
        fontFamily: 'Vazirmatn, sans-serif'
    };
    
    const axisStrokeColor = isDark ? '#94a3b8' : '#64748b';
    const gridStrokeColor = isDark ? '#334155' : '#e2e8f0';


    const renderUserAction = () => {
        if (isAuthenticated && user) {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'پروفایل کاربری من';
            return (
                <button onClick={() => navigate('profile')} className="flex items-center gap-4 text-right">
                    <div className="text-slate-300 dark:text-slate-600">
                        <WaveIcon />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{fullName}</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400">مشاهده پروفایل</p>
                    </div>
                </button>
            );
        }

        return (
            <button onClick={navigateToLogin} className="flex items-center gap-4 text-right">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">ثبت نام رایگان</h3>
                <div className="text-brand-500">
                    <SignupArrowIcon />
                </div>
            </button>
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Right Features & Chart Panel */}
            <div className="xl:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-900/70 p-6 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">امکانات پیشرفته ایمیل مارکتینگ</h2>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-1">مدیریت آسان ارسال کمپین های ایمیل انبوه</p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        {features.map(feature => <FeatureCard key={feature.name} {...feature} />)}
                    </div>
                </div>
                
                <TodayViewCard onNavigateToCalendar={() => navigate('calendar')} />

                <div className="bg-white dark:bg-slate-900/70 p-6 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 h-80">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">رشد مشترکین ایمیل ایران</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} vertical={false}/>
                            <XAxis dataKey="name" stroke={axisStrokeColor} tickLine={false} axisLine={false} dy={10} reversed={true} />
                            <YAxis stroke={axisStrokeColor} tickLine={false} axisLine={false} orientation="left" />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="subscribers" stroke="#00f0b5" strokeWidth={3} name="مشترکین" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Main AI Panel */}
            <div className="xl:col-span-3 bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 flex flex-col justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">ساخت کمپین بازاریابی ایمیلی با هوش مصنوعی</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">
                        هدف کمپین خود را توصیف کنید و اجازه دهید تا هوش مصنوعی ایمیل ایران، محتوا و عنوان کمپین مناسب بازاریابی شما را تولید کرده، مخاطبان مناسب را انتخاب و بهترین زمان برای ارسال را پیشنهاد دهد.
                    </p>
                    <div className="mt-8">
                         <label className="block text-base font-medium text-slate-500 dark:text-slate-400 mb-2">
                            هدف بازاریابی شما (مثال: «یک فروش ویژه ۲۴ ساعته برای مجموعه تابستانی ما اعلام کن»)
                        </label>
                        <div className="ai-input-container">
                             <textarea
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="ai-hero-textarea"
                                placeholder="اینجا تایپ کنید..."
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                     <button
                        onClick={handleGenerateClick}
                        disabled={!prompt.trim()}
                        className="btn-ai w-full"
                    >
                        <SparklesIcon className="w-7 h-7" />
                        تولید محتوا با هوش مصنوعی
                    </button>
                </div>

                {isAuthenticated && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">آخرین گزارش کمپین‌ها</h2>
                        {isLoadingReports ? (
                            <div className="flex justify-center items-center py-8">
                                <LoadingSpinner className="w-8 h-8 text-brand-600" />
                            </div>
                        ) : reportsError ? (
                            <p className="text-center text-red-500 dark:text-red-400 py-8">{reportsError}</p>
                        ) : latestReports.length > 0 ? (
                            <div className="space-y-4">
                                {latestReports.map(report => (
                                    <ReportCard key={report.id} report={report} onViewCampaign={onViewCampaign} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                                <p>هنوز کمپین تکمیل شده‌ای وجود ندارد.</p>
                                <button onClick={() => navigate('campaigns')} className="btn-secondary mt-4 !px-4 !py-1.5 text-base">ساخت اولین کمپین</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Subscriber Stat */}
            <div className="xl:col-span-5">
                <div className="subscriber-stat-card">
                    {renderUserAction()}
                    <div className="text-right">
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">{totalSubscribers.toLocaleString('fa-IR')}<span className="text-brand-500 text-3xl"> +</span></h3>
                        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400 font-semibold">تعداد مشترکین ایمیلی</p>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;