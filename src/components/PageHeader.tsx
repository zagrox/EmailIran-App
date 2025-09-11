import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
    <div className="bg-gradient-to-br from-violet-50 to-slate-100 dark:from-slate-800 dark:to-violet-950/30 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-8 md:p-12 text-center lg:flex lg:items-center lg:justify-between lg:text-right mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl lg:flex-shrink-0">{title}</h1>
        <p className="mt-6 lg:mt-0 lg:mr-8 max-w-3xl mx-auto lg:mx-0 lg:text-right text-lg text-slate-500 dark:text-slate-400">
            {description}
        </p>
    </div>
);

export default PageHeader;