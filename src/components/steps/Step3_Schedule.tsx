
import React, { useState } from 'react';
import type { CampaignState } from '../../types';
import { getBestSendTime } from '../../services/geminiService';
import { SparklesIcon, LoadingSpinner } from '../IconComponents';
import PersianCalendar from '../PersianCalendar';

interface Props {
    campaignData: CampaignState;
    updateCampaignData: <K extends keyof CampaignState>(field: K, value: CampaignState[K]) => void;
}

const Step3Schedule: React.FC<Props> = ({ campaignData, updateCampaignData }) => {
    const { schedule } = campaignData;
    const [isTimeSuggestionLoading, setIsTimeSuggestionLoading] = useState(false);
    const [timeSuggestion, setTimeSuggestion] = useState('');

    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCampaignData('schedule', { ...schedule, [e.target.name]: e.target.value });
    };
    
    const handleDateSelect = (date: string) => {
        updateCampaignData('schedule', { ...schedule, sendDate: date });
    };

    const handleTimezoneToggle = () => {
        updateCampaignData('schedule', { ...schedule, timezoneAware: !schedule.timezoneAware });
    };
    
    const handleGetTimeSuggestion = async () => {
        setIsTimeSuggestionLoading(true);
        setTimeSuggestion('');
        // A real app might pass a more detailed audience description
        const audienceDesc = "مخاطب عمومی از مصرف‌کنندگان آگاه به فناوری";
        const suggestion = await getBestSendTime(audienceDesc);
        setTimeSuggestion(suggestion);
        setIsTimeSuggestionLoading(false);
    };

    const handlePresetSelect = (preset: 'tomorrow' | 'inThreeDays' | 'nextMonday' | 'nextSaturday') => {
        const now = new Date();
        let sendDate = '';
        let sendTime = '09:00';

        switch (preset) {
            case 'tomorrow':
                const tomorrow = new Date();
                tomorrow.setDate(now.getDate() + 1);
                sendDate = tomorrow.toISOString().split('T')[0];
                break;
            case 'inThreeDays':
                const inThreeDays = new Date();
                inThreeDays.setDate(now.getDate() + 3);
                sendDate = inThreeDays.toISOString().split('T')[0];
                sendTime = '10:00';
                break;
            case 'nextMonday':
                const nextMonday = new Date();
                const todayJsDayMon = now.getDay(); // Sunday: 0, Monday: 1, ...
                let daysUntilMonday = (1 - todayJsDayMon + 7) % 7;
                if (daysUntilMonday === 0) {
                    daysUntilMonday = 7; // If today is Monday, schedule for next Monday
                }
                nextMonday.setDate(now.getDate() + daysUntilMonday);
                sendDate = nextMonday.toISOString().split('T')[0];
                break;
            case 'nextSaturday':
                const nextSaturday = new Date();
                const todayJsDaySat = now.getDay(); // Sunday: 0, Saturday: 6
                let daysUntilSaturday = (6 - todayJsDaySat + 7) % 7;
                if (daysUntilSaturday === 0) {
                    daysUntilSaturday = 7; // If today is Saturday, schedule for next Saturday
                }
                nextSaturday.setDate(now.getDate() + daysUntilSaturday);
                sendDate = nextSaturday.toISOString().split('T')[0];
                sendTime = '11:00';
                break;
        }
        
        updateCampaignData('schedule', { ...schedule, sendDate, sendTime });
    };

    const isTimezoneAware = schedule.timezoneAware;

    return (
        <div className="animate-slide-in-up">
            <h2 className="h2">زمان ارسال را تنظیم کنید.</h2>
            <p className="p-description">بهترین تاریخ و زمان ارسال کمپین را بر اساس تقویم و با کمک هوش مصنوعی انتخاب کنید.</p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                {/* Calendar */}
                <div className="lg:col-span-3">
                    <PersianCalendar
                        selectedDate={schedule.sendDate}
                        onDateSelect={handleDateSelect}
                    />
                </div>

                {/* Settings */}
                <div className="lg:col-span-2">
                    <div className="card h-fit space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">تنظیمات زمان‌بندی</h3>
                        
                        <div>
                            <label htmlFor="sendTime" className="label mb-2">ساعت ارسال</label>
                            <input
                                type="time"
                                id="sendTime"
                                name="sendTime"
                                value={schedule.sendTime}
                                onChange={handleScheduleChange}
                                className="input text-lg"
                            />
                        </div>

                        <div>
                             <h4 className="label mb-3">گزینه‌های سریع</h4>
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handlePresetSelect('tomorrow')} className="btn-filter btn-filter-unselected text-sm">فردا (۹ صبح)</button>
                                <button onClick={() => handlePresetSelect('inThreeDays')} className="btn-filter btn-filter-unselected text-sm">تا ۳ روز دیگر (۱۰ صبح)</button>
                                <button onClick={() => handlePresetSelect('nextSaturday')} className="btn-filter btn-filter-unselected text-sm">شنبه آینده (۱۱ صبح)</button>
                                <button onClick={() => handlePresetSelect('nextMonday')} className="btn-filter btn-filter-unselected text-sm">دوشنبه آینده (۹ صبح)</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 p-4 rounded-lg">
                            <span className="font-medium text-slate-900 dark:text-white">تحویل متناسب با منطقه زمانی</span>
                            <button
                                onClick={handleTimezoneToggle}
                                className={`toggle-switch ${isTimezoneAware ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                            >
                                <span className={`toggle-switch-handle ${isTimezoneAware ? 'toggle-switch-handle-on' : 'toggle-switch-handle-off'}`} />
                            </button>
                        </div>

                        <div>
                            <button
                                onClick={handleGetTimeSuggestion}
                                disabled={isTimeSuggestionLoading}
                                className="w-full flex items-center justify-center gap-2 text-base px-4 py-2 bg-brand-600/20 text-brand-600 rounded-md hover:bg-brand-600/30 transition-colors disabled:opacity-50"
                            >
                                {isTimeSuggestionLoading ? <LoadingSpinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                                پیشنهاد بهترین زمان ارسال
                            </button>
                            {timeSuggestion && (
                                <div className="mt-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-center text-base text-slate-600 dark:text-slate-300">
                                    <p><strong>پیشنهاد هوش مصنوعی:</strong> {timeSuggestion}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3Schedule;