
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Report } from '../../types';
import { STYLES } from '../../styles';

interface Props {
    theme: 'light' | 'dark';
    viewedReport: Report | null;
    onStartNewCampaign: () => void;
    onBackToReports: () => void;
}

const defaultAnalyticsData = {
    stats: {
        openRate: 28.7,
        clickRate: 4.1,
        conversions: 134,
    },
    chartData: [
      { name: '۱ ساعت', opens: 1200, clicks: 150 },
      { name: '۳ ساعت', opens: 2500, clicks: 400 },
      { name: '۶ ساعت', opens: 2800, clicks: 550 },
      { name: '۱۲ ساعت', opens: 3100, clicks: 610 },
      { name: '۲۴ ساعت', opens: 3580, clicks: 702 },
      { name: '۴۸ ساعت', opens: 3820, clicks: 750 },
    ]
};

const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className={STYLES.card.container}>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

const Step5Analytics: React.FC<Props> = ({ theme, viewedReport, onStartNewCampaign, onBackToReports }) => {
    const isDark = theme === 'dark';
    const isViewingPastReport = !!viewedReport;

    const analyticsData = viewedReport ? viewedReport : defaultAnalyticsData;
    const { stats, chartData } = analyticsData;

    const mainButtonText = isViewingPastReport ? 'بازگشت به گزارش‌ها' : 'ایجاد کمپین جدید';
    const mainButtonAction = isViewingPastReport ? onBackToReports : onStartNewCampaign;
    
    const pageTitle = isViewingPastReport ? `گزارش: ${viewedReport.name}` : '🚀 ارسال با موفقیت تایید شد!';
    const pageDescription = isViewingPastReport 
        ? `ارسال شده در ${new Date(viewedReport.sentDate).toLocaleDateString('fa-IR', { dateStyle: 'full' })}`
        : 'کمپین شما در راه است. جادو را به صورت زنده تماشا کنید، همانطور که داده‌های شما جان می‌گیرند.';


    const tooltipStyle: React.CSSProperties = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        color: isDark ? '#e2e8f0' : '#1e293b',
        direction: 'rtl',
        fontFamily: 'Vazirmatn, sans-serif'
    };
    
    const labelStyle = { color: isDark ? '#cbd5e1' : '#475569' };
    const legendStyle: React.CSSProperties = { color: isDark ? '#e2e8f0' : '#1e293b', direction: 'rtl' };
    const axisStrokeColor = isDark ? '#94a3b8' : '#64748b';
    const gridStrokeColor = isDark ? '#334155' : '#e2e8f0';

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{pageTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">{pageDescription}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-right">
                <StatCard title="نرخ باز شدن" value={`${stats.openRate.toLocaleString('fa-IR')}%`} description="باز شدن‌های یکتا در مقابل تحویل داده شده"/>
                <StatCard title="نرخ کلیک" value={`${stats.clickRate.toLocaleString('fa-IR')}%`} description="کلیک‌های یکتا در مقابل تحویل داده شده"/>
                <StatCard title="تبدیل‌ها" value={stats.conversions.toLocaleString('fa-IR')} description="اهداف تکمیل شده از این کمپین"/>
            </div>

            <div className={`${STYLES.card.container} h-96`}>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: -10, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                        <XAxis dataKey="name" stroke={axisStrokeColor} reversed={true} />
                        <YAxis stroke={axisStrokeColor} orientation="right" />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            labelStyle={labelStyle}
                        />
                        <Legend wrapperStyle={legendStyle}/>
                        <Line type="monotone" dataKey="opens" stroke="#6D28D9" strokeWidth={2} name="باز شدن" />
                        <Line type="monotone" dataKey="clicks" stroke="#6EE7B7" strokeWidth={2} name="کلیک"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-10">
                 <button 
                    onClick={mainButtonAction}
                    className="px-8 py-3 bg-brand-purple text-white rounded-md hover:bg-violet-700 transition-colors duration-200 font-bold text-lg"
                 >
                    {mainButtonText}
                 </button>
            </div>
        </div>
    );
};

export default Step5Analytics;