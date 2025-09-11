

import React from 'react';
import { Report } from '../types.ts';
import { ClockIcon } from './IconComponents.tsx';
import { STYLES } from '../styles.ts';
import PageHeader from './PageHeader.tsx';

interface ReportCardProps {
    report: Report;
    onViewReport: (report: Report) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onViewReport }) => {
    return (
        <div 
            onClick={() => onViewReport(report)}
            className={STYLES.card.report}
        >
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{report.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <ClockIcon className="w-4 h-4" />
                    ارسال شده در {new Date(report.sentDate).toLocaleDateString('fa-IR', { dateStyle: 'medium' })}
                </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-3 gap-4 text-center mt-4 sm:mt-0 sm:text-right">
                <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">باز شدن</div>
                    <div className="font-bold text-xl text-brand-purple">{report.stats.openRate}%</div>
                </div>
                <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">کلیک</div>
                    <div className="font-bold text-xl text-brand-mint">{report.stats.clickRate}%</div>
                </div>
                 <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">تبدیل</div>
                    <div className="font-bold text-xl text-yellow-400">{report.stats.conversions}</div>
                </div>
            </div>
        </div>
    );
};


interface ReportsPageProps {
    reports: Report[];
    onViewReport: (report: Report) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ reports, onViewReport }) => {
    return (
        <div>
            <PageHeader
                title="گزارش کمپین‌ها"
                description="عملکرد کمپین‌های گذشته خود را بررسی کنید تا استراتژی آینده خود را بهینه کنید."
            />
            <div className="space-y-6">
                {reports.map(report => (
                    <ReportCard key={report.id} report={report} onViewReport={onViewReport} />
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;