
import React from 'react';
import { ChevronLeftIcon } from './IconComponents';

interface TodayViewCardProps {
    onNavigateToCalendar: () => void;
}

const TodayViewCard: React.FC<TodayViewCardProps> = ({ onNavigateToCalendar }) => {
    const today = new Date();
    
    // Persian (Jalali) date
    const persianDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const persianDateParts = persianDateFormatter.formatToParts(today);
    const p_day = persianDateParts.find(p => p.type === 'day')?.value;
    const p_month = persianDateParts.find(p => p.type === 'month')?.value;
    const p_year = persianDateParts.find(p => p.type === 'year')?.value;
    const formattedPersianDate = `${p_day} ${p_month} ماه ${p_year}`;

    // Gregorian date with English numerals and format
    const gregorianDateFormatter = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedGregorianDate = gregorianDateFormatter.format(today);

    return (
        <button
            onClick={onNavigateToCalendar}
            className="w-full p-[2px] bg-gradient-to-r from-sky-300 to-violet-400 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:shadow-slate-950/50"
            aria-label={`Navigate to calendar for today, ${formattedPersianDate}`}
        >
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-[14px] p-4 flex items-center justify-between">
                {/* Navigation Arrow */}
                <span className="text-slate-300 dark:text-slate-600">
                    <ChevronLeftIcon className="w-6 h-6" />
                </span>

                {/* Date Display (centered) */}
                <p className="font-normal text-lg text-slate-800 dark:text-white text-center">
                    امروز: {formattedPersianDate}
                </p>

                {/* Invisible spacer to balance the layout and center the date */}
                <span className="w-6" aria-hidden="true" />

                {/* Date Display (centered) */}
                <p className="font-normal text-md text-slate-800 dark:text-white text-center">
                    {formattedGregorianDate}
                </p>


            </div>
        </button>
    );
};

export default TodayViewCard;
