import React, { useState } from 'react';
import PersianCalendar from './PersianCalendar';
import PageHeader from './PageHeader';

interface CalendarPageProps {
    onStartCampaign: (date: string) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onStartCampaign }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        // In a more advanced version, we could display campaigns or events scheduled for this day.
    };

    return (
        <div>
            <PageHeader 
                title="تقویم بازاریابی"
                description="از تقویم برای مشاهده مناسبت‌های مهم و رویدادهای کلیدی استفاده کنید تا کمپین‌ها را بهتر برنامه‌ریزی کنید."
            />
            <div className="mt-8">
                <PersianCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    ctaText="ساخت کمپین در این تاریخ"
                    onCtaClick={() => onStartCampaign(selectedDate)}
                />
            </div>
        </div>
    );
};

export default CalendarPage;