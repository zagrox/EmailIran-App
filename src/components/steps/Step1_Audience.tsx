

import React, { useMemo } from 'react';
import type { CampaignState, AudienceCategory } from '../../types';
import { UsersIcon, SparklesIcon } from '../IconComponents';

interface Props {
  campaignData: CampaignState;
  updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
  onOpenAIAssistant: () => void;
  audienceCategories: AudienceCategory[];
}

const healthColorMap = {
    'Excellent': 'health-excellent',
    'Good': 'health-good',
    'Poor': 'health-poor',
};

const healthIndicatorMap = {
    'Excellent': 'health-indicator-excellent',
    'Good': 'health-indicator-good',
    'Poor': 'health-indicator-poor',
};

const healthTranslationMap = {
    'Excellent': 'عالی',
    'Good': 'خوب',
    'Poor': 'ضعیف',
};

const CategoryCard: React.FC<{ category: AudienceCategory; isSelected: boolean; onSelect: (id: string) => void }> = ({ category, isSelected, onSelect }) => (
    <div
        onClick={() => onSelect(category.id)}
        className={`card-category ${
            isSelected ? 'card-category-selected' : 'card-category-unselected'
        }`}
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-900 dark:text-white">{category.name_fa}</h4>
            <div className={`text-sm font-semibold px-2 py-0.5 rounded-full ${healthColorMap[category.health]}`}>{healthTranslationMap[category.health]}</div>
        </div>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-1">{category.count.toLocaleString('fa-IR')} مشترک</p>
    </div>
);


const Step1Audience: React.FC<Props> = ({ campaignData, updateCampaignData, onOpenAIAssistant, audienceCategories }) => {
    const { audience } = campaignData;

    const handleCategoryToggle = (categoryId: string) => {
        const newCategoryIds = audience.categoryIds.includes(categoryId)
            ? audience.categoryIds.filter(id => id !== categoryId)
            : [...audience.categoryIds, categoryId];

        const selectedCategories = audienceCategories.filter(c => newCategoryIds.includes(c.id));
        const totalHealthScore = selectedCategories.reduce((acc, c) => {
            const score = c.health === 'Excellent' ? 95 : c.health === 'Good' ? 75 : 25;
            return acc + score;
        }, 0);
        const avgHealthScore = selectedCategories.length > 0 ? totalHealthScore / selectedCategories.length : 0;

        updateCampaignData('audience', {
            ...audience,
            categoryIds: newCategoryIds,
            segmentId: null,
            healthScore: avgHealthScore,
        });
    };

    const selectedCategories = useMemo(() => 
        audienceCategories.filter(c => audience.categoryIds.includes(c.id)), 
        [audience.categoryIds, audienceCategories]
    );

    const totalRecipients = useMemo(() =>
        selectedCategories.reduce((sum, c) => sum + c.count, 0),
        [selectedCategories]
    );

    const averageHealthStatus = useMemo(() => {
        if (audience.healthScore >= 85) return 'Excellent';
        if (audience.healthScore >= 60) return 'Good';
        return 'Poor';
    }, [audience.healthScore]);


    return (
        <div className="animate-slide-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <h2 className="h2">افراد خود را انتخاب کنید</h2>
                <button 
                    onClick={() => onOpenAIAssistant()}
                    className="btn-ai mt-4 sm:mt-0"
                >
                    <SparklesIcon className="w-6 h-6" />
                    ایجاد با هوش مصنوعی
                </button>
            </div>

            <p className="p-description">مخاطبان عالی خود را انتخاب کنید—یا اجازه دهید هوش مصنوعی این کار را برای شما انجام دهد.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">مخاطبان تخصصی</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {audienceCategories.map(category => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                isSelected={audience.categoryIds.includes(category.id)}
                                onSelect={handleCategoryToggle}
                            />
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-brand-mint"/>
                        خلاصه مخاطبان
                    </h3>
                    {selectedCategories.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            <div>
                                <div className="summary-label">بخش های انتخاب شده</div>
                                <ul className="list-disc list-inside mr-4 mt-2 space-y-1">
                                {selectedCategories.map(c => (
                                    <li key={c.id} className="text-lg font-semibold text-slate-900 dark:text-white">{c.name_fa}</li>
                                ))}
                                </ul>
                            </div>
                            <div>
                                <div className="summary-label">مجموع گیرندگان تخمینی</div>
                                <div className="summary-value">{totalRecipients.toLocaleString('fa-IR')}</div>
                            </div>
                            <div>
                                <div className="summary-label mb-2">میانگین سلامت لیست</div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div 
                                        className={`${healthIndicatorMap[averageHealthStatus]} h-2.5 rounded-full transition-all duration-500`} 
                                        style={{width: `${audience.healthScore}%`}}
                                    ></div>
                                </div>
                                <div className={`text-left text-base mt-1 font-semibold ${healthColorMap[averageHealthStatus].split(' ')[0]}`}>
                                    {healthTranslationMap[averageHealthStatus]}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-center text-slate-500 dark:text-slate-400 py-10">
                            برای دیدن جزئیات، یک یا چند بخش را انتخاب کنید.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step1Audience;
