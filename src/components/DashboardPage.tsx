

import React, { useState } from 'react';
import { SparklesIcon, MailIcon, UsersIcon, ChartBarIcon, CalendarDaysIcon } from './IconComponents';
import { AUDIENCE_CATEGORIES, MOCK_REPORTS } from '../constants';
import PageHeader from './PageHeader';

type Page = 'dashboard' | 'audiences' | 'wizard' | 'reports' | 'calendar';

interface DashboardProps {
    theme: 'light' | 'dark';
    onNavigate: (page: Page) => void;
    onOpenAIAssistant: (initialPrompt?: string) => void;
}

const totalSubscribers = AUDIENCE_CATEGORIES.reduce((acc, category) => acc + category.count, 0);
const totalReports = MOCK_REPORTS.length;

// New Widget Component
const AIAssistantDashboardWidget: React.FC<{ onGenerate: (prompt: string) => void; theme: 'light' | 'dark' }> = ({ onGenerate, theme }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
            setPrompt('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerateClick();
        }
    }

    return (
        <div className="lg:col-span-4 bg-slate-100 dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 flex flex-col justify-between transition-all duration-300">
            <div>
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-violet-400" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">دستیار هوش مصنوعی کمپین</h2>
                </div>
                <p className="mt-4 text-slate-700 dark:text-slate-300"> هدف کمپین خود را توصیف کنید</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">مثال: «یک فروش ویژه ۲۴ ساعته برای مجموعه تابستانی ما برای مشتریان وفادار اعلام کن.»</p>
                <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input resize-none"
                    placeholder="اینجا بنویسید..."
                />
            </div>
            <div className="mt-4">
                <button
                    onClick={handleGenerateClick}
                    disabled={!prompt.trim()}
                    className="btn btn-primary w-full py-3"
                >
                    <SparklesIcon className="w-5 h-5" />
                    تولید پیش‌نویس
                </button>
            </div>
        </div>
    );
};


const DashboardPage: React.FC<DashboardProps> = ({ theme, onNavigate, onOpenAIAssistant }) => {
    return (
        <div>
            <PageHeader 
                title="با جادوگر بازاریابی متحول شوید"
                description="نقطه شروع خلاقانه برای ایجاد، مدیریت و تحلیل کمپین‌های ایمیل"
            />

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* AI Assistant Widget */}
                <AIAssistantDashboardWidget theme={theme} onGenerate={(prompt) => onOpenAIAssistant(prompt)} />

                {/* Create Campaign Card - now smaller */}
                <div className="card-dashboard card-dashboard-hover lg:col-span-2 cursor-pointer" onClick={() => onNavigate('wizard')}>
                     <div>
                        <div className="dashboard-icon-container bg-brand-mint/20">
                            <MailIcon className="w-6 h-6 text-brand-mint" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">ایجاد کمپین جدید</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">یک کمپین جدید را از طریق جادوگر گام به گام بسازید.</p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-brand-mint">شروع ساخت ←</span>
                    </div>
                </div>

                {/* Audiences Card */}
                 <div className="card-dashboard card-dashboard-hover lg:col-span-2 cursor-pointer" onClick={() => onNavigate('audiences')}>
                     <div>
                        <div className="dashboard-icon-container bg-sky-500/20">
                            <UsersIcon className="w-6 h-6 text-sky-500" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">مخاطبان</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{totalSubscribers.toLocaleString('fa-IR')}</span> مشترک در <span className="font-bold text-slate-700 dark:text-slate-200">{AUDIENCE_CATEGORIES.length}</span> دسته.
                        </p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-sky-500">مدیریت مخاطبان ←</span>
                    </div>
                </div>
                
                {/* Reports Card */}
                 <div className="card-dashboard card-dashboard-hover lg:col-span-2 cursor-pointer" onClick={() => onNavigate('reports')}>
                     <div>
                        <div className="dashboard-icon-container bg-amber-500/20">
                            <ChartBarIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">گزارش‌ها</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-200">{totalReports}</span> کمپین ارسال شده. عملکرد را پیگیری کنید.</p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-amber-500">مشاهده گزارش‌ها ←</span>
                    </div>
                </div>
                
                {/* Calendar Card */}
                 <div className="card-dashboard card-dashboard-hover lg:col-span-2 cursor-pointer" onClick={() => onNavigate('calendar')}>
                     <div>
                        <div className="dashboard-icon-container bg-rose-500/20">
                            <CalendarDaysIcon className="w-6 h-6 text-rose-500" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">تقویم</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">مناسبت‌های مهم را مشاهده کرده و کمپین‌های خود را برنامه‌ریزی کنید.</p>
                    </div>
                    <div className="mt-6">
                        <span className="font-semibold text-rose-500">مشاهده تقویم ←</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;