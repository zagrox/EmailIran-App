

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

    const isTimezoneAware = schedule.timezoneAware;
    
    const timeInput = (
        <div>
            <label htmlFor="sendTime" className="label mb-2 text-center">ساعت ارسال</label>
            <input
                type="time"
                id="sendTime"
                name="sendTime"
                value={schedule.sendTime}
                onChange={handleScheduleChange}
                className="input text-center text-lg"
            />
        </div>
    );

    return (
        <div className="animate-slide-in-up">
            <h2 className="h2">زمان‌بندی را تنظیم کنید</h2>
            <p className="p-description">مانند یک حرفه‌ای با تحویل آگاه از منطقه زمانی و پیش‌بینی‌های هوشمند، زمان‌بندی کنید.</p>

            <div className="mt-8">
                <PersianCalendar
                    selectedDate={schedule.sendDate}
                    onDateSelect={handleDateSelect}
                    footerContent={timeInput}
                />
            </div>
            
            <div className="max-w-md mx-auto mt-6 space-y-6">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 p-4 rounded-lg">
                    <span className="font-medium text-slate-900 dark:text-white">تحویل آگاه از منطقه زمانی</span>
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
                        className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 bg-brand-purple/20 text-brand-purple rounded-md hover:bg-brand-purple/30 transition-colors disabled:opacity-50"
                    >
                        {isTimeSuggestionLoading ? <LoadingSpinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        پیشنهاد بهترین زمان ارسال
                    </button>
                    {timeSuggestion && (
                        <div className="mt-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">
                            <p><strong>پیشنهاد هوش مصنوعی:</strong> {timeSuggestion}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3Schedule;