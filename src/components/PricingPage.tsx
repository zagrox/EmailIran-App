
import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from './PageHeader';
import { LoadingSpinner } from './IconComponents';
import type { PricingTier } from '../types';

const PricingPage: React.FC = () => {
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [volume, setVolume] = useState(50000);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                // Endpoint provided by user, assuming it's a singleton and returns one object
                const response = await fetch('https://crm.ir48.com/items/pricing');
                if (!response.ok) {
                    throw new Error('پاسخ شبکه موفقیت‌آمیز نبود');
                }
                const { data } = await response.json();
                if (data && Array.isArray(data.pricing_slot)) {
                    // Sort tiers by volume descending to make finding the rate easier
                    const sortedTiers = data.pricing_slot.sort((a: PricingTier, b: PricingTier) => b.pricing_volume - a.pricing_volume);
                    setTiers(sortedTiers);
                    if (sortedTiers.length > 0) {
                        // Set initial volume to the lowest tier's volume
                        setVolume(sortedTiers[sortedTiers.length - 1].pricing_volume);
                    }
                } else {
                    throw new Error('داده‌های قیمت‌گذاری در فرمت مورد انتظار نیست.');
                }
            } catch (err: any) {
                setError(err.message || 'خطا در دریافت داده‌های قیمت‌گذاری.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPricing();
    }, []);

    const { currentTier, totalCost } = useMemo(() => {
        if (tiers.length === 0) {
            return { currentTier: null, totalCost: 0 };
        }
        // Find the highest tier that the current volume qualifies for
        const foundTier = tiers.find(tier => volume >= tier.pricing_volume);
        
        // If volume is below the lowest tier, use the lowest tier's rate
        const effectiveTier = foundTier || tiers[tiers.length - 1];

        const cost = volume * effectiveTier.pricing_rate;
        return { currentTier: effectiveTier, totalCost: cost };
    }, [volume, tiers]);
    
    // Dynamically set min/max for the slider
    const minVolume = tiers.length > 0 ? tiers[tiers.length - 1].pricing_volume : 50000;
    const maxVolume = tiers.length > 0 ? tiers[0].pricing_volume * 1.5 : 5000000;


    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseInt(e.target.value, 10));
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner className="w-12 h-12 text-brand-600" />
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center py-20 card">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
            );
        }
        return (
            <div className="page-main-content">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">محاسبه هزینه کمپین</h3>
                            <p className="text-base text-slate-500 dark:text-slate-400 mb-6">با استفاده از اسلایدر زیر، تعداد ایمیل‌های ارسالی خود را انتخاب کنید تا هزینه تخمینی را مشاهده نمایید.</p>
                            
                            <div className="space-y-4">
                                <label htmlFor="volume-slider" className="label">تعداد ایمیل‌های ارسالی: <span className="font-bold text-brand-600 dark:text-brand-400 text-lg">{volume.toLocaleString('fa-IR')}</span></label>
                                <input
                                    id="volume-slider"
                                    type="range"
                                    min={minVolume}
                                    max={maxVolume}
                                    step="1000"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="input-range"
                                />
                                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                    <span>{minVolume.toLocaleString('fa-IR')}</span>
                                    <span>{maxVolume.toLocaleString('fa-IR')}</span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-100 dark:bg-slate-900/70 rounded-lg">
                                    <p className="summary-label">تعداد ایمیل</p>
                                    <p className="summary-value">{volume.toLocaleString('fa-IR')}</p>
                                </div>
                                 <div className="p-4 bg-slate-100 dark:bg-slate-900/70 rounded-lg">
                                    <p className="summary-label">هزینه هر ایمیل</p>
                                    <p className="summary-value">{currentTier ? currentTier.pricing_rate.toLocaleString('fa-IR') : '-'} <span className="text-base font-normal">تومان</span></p>
                                </div>
                                <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-lg ring-2 ring-brand-500">
                                    <p className="summary-label !text-brand-700 dark:!text-brand-300">هزینه نهایی</p>
                                    <p className="summary-value !text-brand-600 dark:!text-brand-300">{totalCost.toLocaleString('fa-IR')} <span className="text-base font-normal">تومان</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">سطوح قیمت‌گذاری</h3>
                        <ul className="space-y-3">
                            {tiers.slice().reverse().map(tier => (
                                <li key={tier.pricing_level} className={`p-3 rounded-lg transition-all duration-200 ${currentTier?.pricing_level === tier.pricing_level ? 'bg-brand-500/20 ring-2 ring-brand-500' : 'bg-slate-100 dark:bg-slate-800/80'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{tier.pricing_level}</span>
                                        <span className="font-semibold text-brand-600 dark:text-brand-400">{tier.pricing_rate.toLocaleString('fa-IR')} تومان / ایمیل</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">شروع از {tier.pricing_volume.toLocaleString('fa-IR')} ارسال</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageHeader 
                title="ماشین حساب قیمت"
                description="هزینه کمپین‌های ایمیل خود را بر اساس حجم ارسال به سادگی تخمین بزنید."
            />
            {renderContent()}
        </div>
    );
};

export default PricingPage;
