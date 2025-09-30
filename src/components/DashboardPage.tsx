
import React, { useState, useMemo } from 'react';
import { SparklesIcon, CalendarDaysIcon, ChartBarIcon, ShoppingCartIcon, ClipboardDocumentListIcon, PaintBrushIcon, WaveIcon, SignupArrowIcon } from './IconComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AudienceCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import TodayViewCard from './TodayViewCard';

interface DashboardProps {
    theme: 'light' | 'dark';
    onOpenAIAssistant: (initialPrompt?: string) => void;
    audienceCategories: AudienceCategory[];
}

const chartData = [
  { name: 'اسفند', subscribers: 20000 },
  { name: 'فروردین', subscribers: 27800 },
  { name: 'اردیبهشت', subscribers: 26000 },
  { name: 'خرداد', subscribers: 38000 },
  { name: 'تیر', subscribers: 39000 },
];

const features = [
    { name: 'ساخت کمپین هوشمند', icon: <SparklesIcon className="w-8 h-8"/> },
    { name: 'ثبت و مدیریت سفارش', icon: <ShoppingCartIcon className="w-8 h-8"/> },
    { name: 'انتشار آنلاین کمپین', icon: <ClipboardDocumentListIcon className="w-8 h-8"/> },
    { name: 'طراحی با قالب‌ساز', icon: <PaintBrushIcon className="w-8 h-8"/> },
    { name: 'کمپین‌ها و گزارشات', icon: <ChartBarIcon className="w-8 h-8"/> },
    { name: 'رویدادهای رسمی', icon: <CalendarDaysIcon className="w-8 h-8"/> },
];

const FeatureCard: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="feature-card">
        <div className="text-brand-mint">{icon}</div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{name}</span>
    </div>
);

const DashboardPage: React.FC<DashboardProps> = ({ theme, onOpenAIAssistant, audienceCategories }) => {
    const [prompt, setPrompt] = useState('');
    const { isAuthenticated, user } = useAuth();
    const { navigateToLogin, navigate } = useUI();
    const isDark = theme === 'dark';

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
                <div className="text-brand-mint">
                    <SignupArrowIcon />
                </div>
            </button>
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
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
            </div>

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
                            <Line type="monotone" dataKey="subscribers" stroke="#6EE7B7" strokeWidth={3} name="مشترکین" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Subscriber Stat */}
            <div className="xl:col-span-5">
                <div className="subscriber-stat-card">
                    <div className="text-right">
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">{totalSubscribers.toLocaleString('fa-IR')}<span className="text-brand-mint text-3xl"> +</span></h3>
                        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400 font-semibold">تعداد مشترکین در لیست‌ها</p>
                    </div>
                    {renderUserAction()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
