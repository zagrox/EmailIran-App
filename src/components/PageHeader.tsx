import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => (
    <div className="bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-800 dark:to-brand-950/30 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-8 md:p-12 lg:flex lg:items-center lg:justify-between mb-10 animate-fade-in">
        <div className="flex-grow">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl text-center lg:text-right">{title}</h1>
            <p className="mt-2 max-w-3xl mx-auto lg:mx-0 text-lg text-slate-500 dark:text-slate-400 text-center lg:text-right">
                {description}
            </p>
        </div>
        {children && (
            <div className="mt-6 lg:mt-0 lg:mr-8 flex-shrink-0 flex justify-center">
                {children}
            </div>
        )}
    </div>
);

export default PageHeader;