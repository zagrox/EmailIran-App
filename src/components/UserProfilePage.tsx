import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import { SunIcon, MoonIcon, DesktopIcon, UserIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import the centralized Page type to resolve conflicting type definitions.
import type { Page } from '../types';

type Theme = 'light' | 'dark' | 'system';

// FIX: The local, incorrect 'Page' type definition was removed to use the centralized one from src/types.ts.
// This was the primary source of the build error.
interface UserProfilePageProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onNavigate: (page: Page) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ theme, setTheme, onNavigate }) => {
    const { user, isAuthenticated, logout, openLoginModal } = useAuth();
    
    // Local state for UI elements, initialized with user data if available
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [notifications, setNotifications] = useState({
        campaignSummary: true,
        weeklyReports: true,
        productUpdates: false,
    });
    const [password, setPassword] = useState({ current: '', new: '', confirm: ''});

    useEffect(() => {
        if (user) {
            setName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
            setEmail(user.email || '');
            setCompany(user.company || 'شرکت نوآوران پیشرو');
            setRole(user.role || 'مدیر بازاریابی');
        }
    }, [user]);

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        logout();
        onNavigate('dashboard');
    };

    if (!isAuthenticated) {
        return (
            <div className="text-center py-20 animate-fade-in">
                 <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 mb-6">
                    <UserIcon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">به حساب کاربری خود وارد شوید</h2>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">برای مشاهده و ویرایش پروفایل خود، لطفاً وارد شوید.</p>
                <button onClick={openLoginModal} className="btn btn-primary mt-8">
                    ورود به حساب کاربری
                </button>
            </div>
        )
    }

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
                    <div className="card">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اطلاعات کاربری</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="label">نام کامل</label>
                                <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
                            </div>
                            <div>
                                <label htmlFor="email" className="label">آدرس ایمیل</label>
                                <input type="email" id="email" name="email" value={email} readOnly className="input mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed" />
                            </div>
                            <div>
                                <label htmlFor="company" className="label">شرکت</label>
                                <input type="text" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)} className="input mt-1" />
                            </div>
                            <div>
                                <label htmlFor="role" className="label">نقش</label>
                                <input type="text" id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)} className="input mt-1" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                             <button onClick={handleLogout} className="btn btn-secondary bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900">خروج</button>
                            <button disabled className="btn btn-primary">ذخیره تغییرات</button>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تغییر رمز عبور</h3>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="current" className="label">رمز عبور فعلی</label>
                                <input type="password" id="current" name="current" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} className="input mt-1" />
                            </div>
                            <div>
                                <label htmlFor="new" className="label">رمز عبور جدید</label>
                                <input type="password" id="new" name="new" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} className="input mt-1" />
                            </div>
                            <div>
                                <label htmlFor="confirm" className="label">تکرار رمز عبور جدید</label>
                                <input type="password" id="confirm" name="confirm" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} className="input mt-1" />
                            </div>
                         </div>
                          <div className="mt-6 text-right">
                            <button disabled className="btn btn-secondary">بروزرسانی رمز عبور</button>
                        </div>
                    </div>
                </div>
                {/* Settings Column */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="card">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اعلان‌ها</h3>
                         <div className="space-y-6">
                            <NotificationToggle 
                                label="خلاصه عملکرد کمپین"
                                description="گزارش خلاصه ۲۴ ساعته پس از ارسال."
                                enabled={notifications.campaignSummary}
                                onToggle={() => handleNotificationToggle('campaignSummary')}
                            />
                             <NotificationToggle 
                                label="گزارش‌های هفتگی"
                                description="خلاصه فعالیت هفتگی حساب."
                                enabled={notifications.weeklyReports}
                                onToggle={() => handleNotificationToggle('weeklyReports')}
                            />
                             <NotificationToggle 
                                label="بروزرسانی‌های محصول"
                                description="اخبار ویژگی‌های جدید و بهترین شیوه‌ها."
                                enabled={notifications.productUpdates}
                                onToggle={() => handleNotificationToggle('productUpdates')}
                            />
                         </div>
                    </div>
                    {/* Display Settings Card */}
                    <div className="card">
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
                                    <span className="font-semibold text-base text-slate-700 dark:text-slate-200">{option.name}</span>
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
            <p className="text-base text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`toggle-switch ${enabled ? 'toggle-switch-on' : 'toggle-switch-off'} flex-shrink-0 mt-1`}
        >
            <span className={`toggle-switch-handle ${enabled ? 'toggle-switch-handle-on' : 'toggle-switch-handle-off'}`} />
        </button>
    </div>
);

export default UserProfilePage;