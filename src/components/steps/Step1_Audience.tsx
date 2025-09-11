
import React, { useMemo } from 'react';
import { CampaignState, AudienceCategory } from '../../types.ts';
import { AUDIENCE_CATEGORIES } from '../../constants.ts';
import { UsersIcon, SparklesIcon } from '../IconComponents.tsx';
import { STYLES } from '../../styles.ts';

interface Props {
  campaignData: CampaignState;
  updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
  onOpenAIAssistant: () => void;
}

const MOCK_FILTERS = ['مستقر در ایران', 'ایمیل آخر را باز کرده‌اند', 'در ۳۰ روز گذشته روی لینکی کلیک کرده‌اند', 'بیش از ۳ بار خرید کرده‌اند'];

const healthColorMap = {
    'Excellent': STYLES.health.excellent,
    'Good': STYLES.health.good,
    'Poor': STYLES.health.poor,
};

const healthIndicatorMap = {
    'Excellent': STYLES.health.indicatorExcellent,
    'Good': STYLES.health.indicatorGood,
    'Poor': STYLES.health.indicatorPoor,
};

const healthTranslationMap = {
    'Excellent': 'عالی',
    'Good': 'خوب',
    'Poor': 'ضعیف',
};

const CategoryCard: React.FC<{ category: AudienceCategory; isSelected: boolean; onSelect: (id: string) => void }> = ({ category, isSelected, onSelect }) => (
    <div
        onClick={() => onSelect(category.id)}
        className={`${STYLES.card.categoryBase} ${
            isSelected ? STYLES.card.categorySelected : STYLES.card.categoryUnselected
        }`}
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-900 dark:text-white">{category.name_fa}</h4>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${healthColorMap[category.health]}`}>{healthTranslationMap[category.health]}</div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{category.count.toLocaleString('fa-IR')} مشترک</p>
    </div>
);


const Step1Audience: React.FC<Props> = ({ campaignData, updateCampaignData, onOpenAIAssistant }) => {
    const { audience } = campaignData;

    const handleCategorySelect = (categoryId: string) => {
        const selectedCategory = AUDIENCE_CATEGORIES.find(c => c.id === categoryId);
        const healthScore = selectedCategory?.health === 'Excellent' ? 95 : selectedCategory?.health === 'Good' ? 75 : 25;
        updateCampaignData('audience', {
            ...audience,
            categoryId,
            segmentId: null,
            healthScore,
        });
    };

    const handleFilterToggle = (filter: string) => {
        const newFilters = audience.filters.includes(filter)
            ? audience.filters.filter(f => f !== filter)
            : [...audience.filters, filter];
        updateCampaignData('audience', { ...audience, filters: newFilters });
    };
    
    const selectedCategory = useMemo(() => AUDIENCE_CATEGORIES.find(c => c.id === audience.categoryId), [audience.categoryId]);

    const summaryName = selectedCategory?.name_fa;
    const summaryCount = selectedCategory?.count;

    return (
        <div className="animate-slide-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <h2 className={STYLES.typography.h2}>افراد خود را انتخاب کنید</h2>
                <button 
                    onClick={onOpenAIAssistant}
                    className={STYLES.button.ai}
                >
                    <SparklesIcon className="w-6 h-6" />
                    ایجاد با هوش مصنوعی
                </button>
            </div>

            <p className={STYLES.typography.p}>مخاطبان عالی خود را انتخاب کنید—یا اجازه دهید هوش مصنوعی این کار را برای شما انجام دهد.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">مخاطبان تخصصی</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {AUDIENCE_CATEGORIES.map(category => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                isSelected={audience.categoryId === category.id}
                                onSelect={handleCategorySelect}
                            />
                        ))}
                    </div>


                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">فیلترهای هوشمند</h3>
                    <div className="flex flex-wrap gap-3">
                        {MOCK_FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterToggle(filter)}
                                className={`${STYLES.button.filterBase} ${
                                    audience.filters.includes(filter)
                                    ? STYLES.button.filterSelected
                                    : STYLES.button.filterUnselected
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={STYLES.card.container}>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-brand-mint"/>
                        خلاصه مخاطبان
                    </h3>
                    {selectedCategory ? (
                        <div className="mt-4 space-y-4">
                            <div>
                                <div className={STYLES.typography.summaryLabel}>بخش</div>
                                <div className={STYLES.typography.summaryValue}>{summaryName}</div>
                            </div>
                            <div>
                                <div className={STYLES.typography.summaryLabel}>گیرندگان تخمینی</div>
                                <div className={STYLES.typography.summaryValue}>{summaryCount?.toLocaleString('fa-IR')}</div>
                            </div>
                             {selectedCategory && (
                                <div>
                                    <div className={`${STYLES.typography.summaryLabel} mb-2`}>سلامت لیست</div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div 
                                            className={`${healthIndicatorMap[selectedCategory.health]} h-2.5 rounded-full transition-all duration-500`} 
                                            style={{width: `${audience.healthScore}%`}}
                                        ></div>
                                    </div>
                                    <div className={`text-left text-sm mt-1 font-semibold ${healthColorMap[selectedCategory.health].split(' ')[0]}`}>
                                        {healthTranslationMap[selectedCategory.health]}
                                    </div>
                                </div>
                             )}
                            {audience.filters.length > 0 && (
                                <div>
                                    <div className={STYLES.typography.summaryLabel}>فیلترهای فعال</div>
                                    <ul className="list-disc list-inside mr-4 mt-2 text-slate-700 dark:text-slate-300 text-sm">
                                        {audience.filters.map(f => <li key={f}>{f}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 text-center text-slate-500 dark:text-slate-400 py-10">
                            برای دیدن جزئیات، یک بخش را انتخاب کنید.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step1Audience;