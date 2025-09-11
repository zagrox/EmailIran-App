
import React, { useState } from 'react';
import PageHeader from './PageHeader.tsx';
import { STYLES } from '../styles.ts';
import { SunIcon, MoonIcon, DesktopIcon } from './IconComponents.tsx';

type Theme = 'light' | 'dark' | 'system';

interface UserProfilePageProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const mockUser = {
    name: 'آواتر احمدی',
    email: 'avatar.ahmadi@example.com',
    company: 'شرکت نوآوران پیشرو',
    role: 'مدیر بازاریابی',
    notifications: {
        campaignSummary: true,
        weeklyReports: true,
        productUpdates: false,
    }
};

const UserProfilePage: React.FC<UserProfilePageProps> = ({ theme, setTheme }) => {
    const [user, setUser] = useState(mockUser);
    const [password, setPassword] = useState({ current: '', new: '', confirm: ''});

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleNotificationToggle = (key: keyof typeof user.notifications) => {
        setUser(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = () => {
        console.log('Saving profile...', user);
        // In a real app, this would make an API call.
        alert('اطلاعات با موفقیت ذخیره شد.');
    };
    
    const handleChangePassword = () => {
         console.log('Changing password...');
        // Add validation logic here
        alert('رمز عبور با موفقیت تغییر کرد.');
        setPassword({ current: '', new: '', confirm: '' });
    }

    const isPasswordFormValid = password.new && password.new === password.confirm && password.current;

    const themeOptions = [
        { key: 'light', name: 'روشن', icon: <SunIcon className="w-6 h-6 mx-auto mb-2" /> },
        { key: 'dark', name: 'تیره', icon: <MoonIcon className="w-6 h-6 mx-auto mb-2" /> },
        { key: 'system', name: 'سیستم', icon: <DesktopIcon className="w-6 h-6 mx-auto mb-2" /> },
    ];

    return (
        <div>
            <PageHeader 
                title="پروفایل کاربری"
                description="اطلاعات شخصی، تنظیمات و اعلان‌های خود را مدیریت کنید."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Details Card */}
                    <div className={STYLES.card.container}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اطلاعات کاربری</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className={STYLES.typography.label}>نام کامل</label>
                                <input type="text" id="name" name="name" value={user.name} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="email" className={STYLES.typography.label}>آدرس ایمیل</label>
                                <input type="email" id="email" name="email" value={user.email} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="company" className={STYLES.typography.label}>شرکت</label>
                                <input type="text" id="company" name="company" value={user.company} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="role" className={STYLES.typography.label}>نقش</label>
                                <input type="text" id="role" name="role" value={user.role} onChange={handleInfoChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={handleSaveChanges} className={STYLES.button.primary}>ذخیره تغییرات</button>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className={STYLES.card.container}>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تغییر رمز عبور</h3>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="current" className={STYLES.typography.label}>رمز عبور فعلی</label>
                                <input type="password" id="current" name="current" value={password.current} onChange={handlePasswordChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="new" className={STYLES.typography.label}>رمز عبور جدید</label>
                                <input type="password" id="new" name="new" value={password.new} onChange={handlePasswordChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                            <div>
                                <label htmlFor="confirm" className={STYLES.typography.label}>تکرار رمز عبور جدید</label>
                                <input type="password" id="confirm" name="confirm" value={password.confirm} onChange={handlePasswordChange} className={`${STYLES.input.default} mt-1`} />
                            </div>
                         </div>
                          <div className="mt-6 text-right">
                            <button onClick={handleChangePassword} disabled={!isPasswordFormValid} className={`${STYLES.button.secondary} disabled:opacity-50 disabled:cursor-not-allowed`}>بروزرسانی رمز عبور</button>
                        </div>
                    </div>
                </div>
                {/* Settings Column */}
                <div className="lg:col-span-1 space-y-8">
                    <div className={STYLES.card.container}>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اعلان‌ها</h3>
                         <div className="space-y-6">
                            <NotificationToggle 
                                label="خلاصه عملکرد کمپین"
                                description="گزارش خلاصه ۲۴ ساعته پس از ارسال."
                                enabled={user.notifications.campaignSummary}
                                onToggle={() => handleNotificationToggle('campaignSummary')}
                            />
                             <NotificationToggle 
                                label="گزارش‌های هفتگی"
                                description="خلاصه فعالیت هفتگی حساب."
                                enabled={user.notifications.weeklyReports}
                                onToggle={() => handleNotificationToggle('weeklyReports')}
                            />
                             <NotificationToggle 
                                label="بروزرسانی‌های محصول"
                                description="اخبار ویژگی‌های جدید و بهترین شیوه‌ها."
                                enabled={user.notifications.productUpdates}
                                onToggle={() => handleNotificationToggle('productUpdates')}
                            />
                         </div>
                    </div>
                    {/* Display Settings Card */}
                    <div className={STYLES.card.container}>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تنظیمات نمایش</h3>
                         <div className="flex justify-around items-center gap-4">
                            {themeOptions.map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => setTheme(option.key as Theme)}
                                    aria-label={`Switch to ${option.key} theme`}
                                    className={`flex-1 p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                                        theme === option.key
                                            ? 'bg-violet-50 dark:bg-slate-700/80 border-brand-purple'
                                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {option.icon}
                                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{option.name}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface NotificationToggleProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ label, description, enabled, onToggle }) => (
    <div className="flex justify-between items-start">
        <div className="pr-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{label}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`${STYLES.toggle.base} ${enabled ? STYLES.toggle.on : STYLES.toggle.off} flex-shrink-0 mt-1`}
        >
            <span className={`${STYLES.toggle.handle} ${enabled ? STYLES.toggle.handleOn : STYLES.toggle.handleOff}`} />
        </button>
    </div>
);

export default UserProfilePage;