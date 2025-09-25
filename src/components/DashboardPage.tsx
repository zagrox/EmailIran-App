import React, { useState } from 'react';
import { SparklesIcon, UsersIcon, ChartBarIcon, CalendarDaysIcon } from './IconComponents';
import { MOCK_REPORTS } from '../constants';
// FIX: Import the centralized Page type to resolve conflicting type definitions.
import type { AudienceCategory, Page } from '../types';
import PageHeader from './PageHeader';

interface DashboardProps {
    theme: 'light' | 'dark';
    onNavigate: (page: Page) => void;
    onOpenAIAssistant: (initialPrompt?: string) => void;
    audienceCategories: AudienceCategory[];
}

const totalReports = MOCK_REPORTS.length;

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    hoverRingColor: string;
}> = ({ icon, title, description, onClick, hoverRingColor }) => (
    <div
        onClick={onClick}
        className={`modern-stat-card group ${hoverRingColor}`}
    >
        <div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900/5 dark:bg-white/10 transition-colors group-hover:bg-slate-900/10 dark:group-hover:bg-white/20">
                {icon}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-base text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="mt-6">
            <span className="font-semibold text-brand-purple dark:text-brand-mint transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                مشاهده جزئیات ←
            </span>
        </div>
    </div>
);


const DashboardPage: React.FC<DashboardProps> = ({ theme, onNavigate, onOpenAIAssistant, audienceCategories }) => {
    const [prompt, setPrompt] = useState('');
    
    const totalSubscribers = audienceCategories.reduce((acc, category) => acc + category.count, 0);

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

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Card */}
                <div className="lg:col-span-2 ai-hero-card">
                    <div>
                        <div className="flex items-center gap-3">
                            <SparklesIcon className="w-8 h-8 text-violet-500 dark:text-violet-400" />
                            <h2 className="text-2xl font-bold">دستیار هوش مصنوعی کمپین</h2>
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">
                           هدف کمپین خود را توصیف کنید، و اجازه دهید هوش مصنوعی ما پیام عالی را بسازد، مخاطبان مناسب را انتخاب کند و بهترین زمان برای ارسال را پیشنهاد دهد.
                        </p>
                        <div className="mt-6">
                             <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                هدف شما (مثال: «یک فروش ویژه ۲۴ ساعته برای مجموعه تابستانی ما اعلام کن»)
                            </label>
                            <textarea
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="ai-hero-textarea"
                                placeholder="اینجا تایپ کنید..."
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                         <button
                            onClick={handleGenerateClick}
                            disabled={!prompt.trim()}
                            className="btn-ai flex-grow py-3 text-lg"
                        >
                            <SparklesIcon className="w-6 h-6" />
                            تولید با هوش مصنوعی
                        </button>
                         <button
                            onClick={() => onNavigate('campaigns')}
                            className="btn btn-secondary flex-grow py-3 text-lg"
                        >
                            یا، ساخت دستی
                        </button>
                    </div>
                </div>

                {/* Right Column Stat Cards */}
                <div className="lg:col-span-1 space-y-8">
                    <StatCard
                        icon={<UsersIcon className="w-6 h-6 text-sky-400" />}
                        title="مخاطبان"
                        description={`${totalSubscribers.toLocaleString('fa-IR')} مشترک در ${audienceCategories.length} لیست.`}
                        onClick={() => onNavigate('audiences')}
                        hoverRingColor="hover:ring-2 hover:ring-sky-500/50"
                    />
                    <StatCard
                        icon={<ChartBarIcon className="w-6 h-6 text-amber-400" />}
                        title="گزارش‌ها"
                        description={`${totalReports} کمپین ارسال شده. عملکرد را پیگیری کنید.`}
                        onClick={() => onNavigate('reports')}
                        hoverRingColor="hover:ring-2 hover:ring-amber-500/50"
                    />
                    <StatCard
                        icon={<CalendarDaysIcon className="w-6 h-6 text-rose-400" />}
                        title="تقویم"
                        description="کمپین‌های خود را بر اساس تاریخ‌های کلیدی برنامه‌ریزی کنید."
                        onClick={() => onNavigate('calendar')}
                        hoverRingColor="hover:ring-2 hover:ring-rose-500/50"
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;