
import React, { useState, useMemo } from 'react';
import { EVENTS_BY_MONTH, Event } from '../data/persian-events';

interface Props {
    selectedDate: string; // YYYY-MM-DD
    onDateSelect: (date: string) => void;
    ctaText?: string;
    onCtaClick?: () => void;
}

interface DayObject {
    gregorianDate: Date;
    persianDay: number;
    gregorianDay: number;
    isToday: boolean;
    isSelected: boolean;
    isHoliday: boolean;
    isPast: boolean;
}

const getPersianDateParts = (date: Date) => {
    const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(date);
    return {
        year: format({ year: 'numeric' }),
        monthName: format({ month: 'long' }),
        day: format({ day: 'numeric' }),
        monthNumeric: format({ month: 'numeric' }),
    };
};

const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

const PersianCalendar: React.FC<Props> = ({ selectedDate, onDateSelect, ctaText, onCtaClick }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate || Date.now()));
    const todayStr = toYYYYMMDD(new Date());

    const navigateMonth = (amount: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setViewDate(newDate);
    };

    const { calendarGrid, currentPersianMonthName, currentEvents } = useMemo(() => {
        const grid: (DayObject | { isPlaceholder: true })[] = [];
        const viewDatePersian = getPersianDateParts(viewDate);
        
        let tempDate = new Date(viewDate);
        tempDate.setDate(1); // Start with Gregorian 1st of month for simplicity
        
        // Find the actual first Gregorian day of the current Persian month
        while (getPersianDateParts(tempDate).monthName !== viewDatePersian.monthName) {
            tempDate.setDate(tempDate.getDate() + 1);
        }
        while (getPersianDateParts(tempDate).day !== '۱') {
            tempDate.setDate(tempDate.getDate() - 1);
        }

        const firstDayOfMonth = new Date(tempDate);
        const startDayOfWeek = (firstDayOfMonth.getDay() + 1) % 7; // Shanbeh=0, ..., Jomeh=6

        for (let i = 0; i < startDayOfWeek; i++) {
            grid.push({ isPlaceholder: true });
        }

        while (getPersianDateParts(tempDate).monthName === viewDatePersian.monthName) {
            const currentDateStr = toYYYYMMDD(tempDate);
            const pDayStr = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(tempDate);
            const pDay = parseInt(pDayStr.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));

            const isPast = currentDateStr < todayStr;
            const eventsForDay = EVENTS_BY_MONTH[viewDatePersian.monthName]?.[pDay] || [];
            const isHoliday = eventsForDay.some(e => e.isHoliday);

            grid.push({
                gregorianDate: new Date(tempDate),
                persianDay: pDay,
                gregorianDay: tempDate.getDate(),
                isToday: currentDateStr === todayStr,
                isSelected: currentDateStr === selectedDate,
                isHoliday: isHoliday,
                isPast: isPast,
            });
            tempDate.setDate(tempDate.getDate() + 1);
        }

        return {
            calendarGrid: grid,
            currentPersianMonthName: viewDatePersian.monthName,
            currentEvents: EVENTS_BY_MONTH[viewDatePersian.monthName] || {}
        };
    }, [viewDate, selectedDate, todayStr]);
    
    // FIX: The `events` variable from `Object.entries` was being inferred as `unknown`.
    // Added a type assertion to `Event[]` which is safe based on the structure of `EVENTS_BY_MONTH`.
    const eventsList = Object.entries(currentEvents)
      .flatMap(([day, events]) => (events as Event[]).map(event => ({ day: parseInt(day), ...event })))
      .sort((a, b) => a.day - b.day);

    const getFullPersianYear = (date: Date) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(date);
    const getGregorianRange = (date: Date) => {
        const start = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const tempDate = new Date(date);
        tempDate.setMonth(tempDate.getMonth() + 1);
        const end = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(tempDate);
        return `${start} - ${end}`;
    }
    const getHijriDate = (date: Date) => new Intl.DateTimeFormat('fa-IR-u-ca-islamic-civil', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-4">
            {/* Events List */}
            <div className="md:col-span-1 bg-slate-100 dark:bg-slate-900/70 p-4 rounded-xl">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">مناسبت‌های ماه {currentPersianMonthName}</h3>
                <ul className="space-y-3 text-base h-96 overflow-y-auto pr-2">
                    {eventsList.map((event, index) => (
                        <li key={index} className="flex items-start">
                            <span className={`font-bold w-10 text-right ml-3 ${event.isHoliday ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{event.day}</span>
                            <span className={`${event.isHoliday ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{event.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Calendar */}
            <div className="md:col-span-2 flex flex-col">
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">ماه قبل &rarr;</button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentPersianMonthName} {getFullPersianYear(viewDate)}</h3>
                            <p className="text-base text-slate-500 dark:text-slate-400">{getGregorianRange(viewDate)}</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">{getHijriDate(viewDate)}</p>
                        </div>
                        <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">&larr; ماه بعد</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center font-semibold text-base text-slate-500 dark:text-slate-400 mb-2">
                        <span>ش</span><span>ی</span><span>د</span><span>س</span><span>چ</span><span>پ</span><span>ج</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarGrid.map((day, index) =>
                            // FIX: Removed a stale comment. The type guard is correct.
                            'isPlaceholder' in day ? <div key={index}></div> : (
                                <button
                                    key={index}
                                    onClick={() => onDateSelect(toYYYYMMDD(day.gregorianDate))}
                                    disabled={day.isPast}
                                    className={`
                                        p-2 rounded-lg transition-colors text-center
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600
                                        ${day.isSelected ? 'ring-2 ring-amber-500' : ''}
                                        ${day.isToday && !day.isSelected ? 'bg-brand-500/30' : ''}
                                        ${!day.isSelected ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
                                        ${day.isHoliday ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
                                    `}
                                >
                                    <span className="font-bold text-lg">{day.persianDay.toLocaleString('fa-IR')}</span>
                                    <span className="block text-sm text-slate-400 dark:text-slate-500 mt-1">{day.gregorianDay}</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
                 {ctaText && onCtaClick && (
                    <div className="mt-auto pt-8">
                        <button
                            onClick={onCtaClick}
                            className="btn-gradient w-full"
                        >
                            {ctaText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersianCalendar;