import React from 'react';
import type { AudienceCategory } from '../types';
import { MailIcon } from './IconComponents';
import PageHeader from './PageHeader';

interface AudienceCardProps {
    category: AudienceCategory;
    onStartCampaign: (categoryId: string) => void;
}

const AudienceCard: React.FC<AudienceCardProps> = ({ category, onStartCampaign }) => {
    return (
        <div className="card-audience">
            <div className="sm:pl-5 flex-grow w-full">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{category.name_fa}</h3>
                <p className="text-base text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category.name_en}</p>
                <div className="flex items-center text-slate-600 dark:text-slate-300 mt-3 text-base">
                    <MailIcon className="w-5 h-5 ml-2 text-slate-400" />
                    <span>{category.count.toLocaleString('fa-IR')} ایمیل</span>
                </div>
                <button 
                    onClick={() => onStartCampaign(category.id)}
                    className="mt-4 w-full sm:w-auto px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-brand-purple hover:text-white dark:hover:bg-brand-purple transition-colors duration-200 font-semibold text-base"
                >
                    ساخت کمپین
                </button>
            </div>
            <div className="flex-shrink-0 w-full h-40 sm:w-32 sm:h-32 mt-4 sm:mt-0">
                <img 
                    src={category.imageUrl} 
                    alt={category.name_fa}
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>
        </div>
    );
};


interface AudiencesPageProps {
    onStartCampaign: (categoryId: string) => void;
    audienceCategories: AudienceCategory[];
}

const AudiencesPage: React.FC<AudiencesPageProps> = ({ onStartCampaign, audienceCategories }) => {
    return (
        <div>
            <PageHeader 
                title="مخاطبان خود را انتخاب کنید"
                description="از میان لیست‌های ایمیل تخصصی ما انتخاب کنید تا پیام شما به دست افراد مناسب برسد."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {audienceCategories.map(category => (
                    <AudienceCard key={category.id} category={category} onStartCampaign={onStartCampaign} />
                ))}
            </div>
        </div>
    );
};

export default AudiencesPage;