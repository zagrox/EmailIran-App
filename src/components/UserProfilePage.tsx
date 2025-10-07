import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from './PageHeader';
import { SunIcon, MoonIcon, DesktopIcon, UserIcon, LoadingSpinner, XIcon, ClipboardDocumentListIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNotification } from '../contexts/NotificationContext';
import type { Page } from '../types';

type Theme = 'light' | 'dark' | 'system';

interface UserProfilePageProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onNavigate: (page: Page) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ theme, setTheme, onNavigate }) => {
    const { user, profile, isAuthenticated, logout, updateProfileAndUser, changePassword } = useAuth();
    const { navigateToLogin } = useUI();
    const { addNotification } = useNotification();
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [mobile, setMobile] = useState('');
    const [website, setWebsite] = useState('');
    const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');

    const [isSaving, setIsSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const [notifications, setNotifications] = useState({
        campaignSummary: true,
        weeklyReports: true,
        productUpdates: false,
    });
    const [password, setPassword] = useState({ current: '', new: '', confirm: ''});

    const mapDisplayToTheme = useCallback((display: 'light' | 'dark' | 'auto' | null | undefined): Theme => {
        if (display === 'auto') return 'system';
        if (display === 'dark') return 'dark';
        return 'light';
    }, []);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setEmail(user.email || '');
        }
        if (profile) {
            setCompany(profile.company || '');
            setMobile(profile.mobile || '');
            setWebsite(profile.website || '');
            setAccountType(profile.type || 'personal');
            const profileTheme = mapDisplayToTheme(profile.display);
            if (theme !== profileTheme) {
                setTheme(profileTheme);
            }
        }
    }, [user, profile, theme, setTheme, mapDisplayToTheme]);
    
    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const userData = {
                first_name: firstName,
                last_name: lastName,
            };
            const profileData = {
                company: accountType === 'business' ? company : null,
                mobile,
                website,
                type: accountType,
            };
            await updateProfileAndUser(userData, profileData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleChangePassword = async () => {
        if (password.new.length < 8) {
            addNotification('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.', 'error');
            return;
        }
        if (password.new !== password.confirm) {
            addNotification('رمز عبور جدید و تکرار آن مطابقت ندارند.', 'error');
            return;
        }

        setIsPasswordSaving(true);
        try {
            await changePassword(password.current, password.new);
            setPassword({ current: '', new: '', confirm: '' });
            setIsPasswordModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPasswordSaving(false);
        }
    };

    const handleThemeSelect = async (newTheme: Theme) => {
        setTheme(newTheme);
        try {
            const displayValue = newTheme === 'system' ? 'auto' : newTheme;
            await updateProfileAndUser({}, { display: displayValue });
        } catch (error) {
            console.error("Couldn't save theme preference:", error);
        }
    }

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
                <button onClick={navigateToLogin} className="btn btn-primary mt-8">
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
                description="اطلاعات شخصی، سوابق خرید و تنظیمات خود را مدیریت کنید."
            >
                <button onClick={() => onNavigate('orders')} className="btn btn-primary inline-flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5" />
                    <span>تاریخچه سفارشات</span>
                </button>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="card">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">اطلاعات کاربری</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">نوع حساب</label>
                                    <div className="mt-1 grid grid-cols-2 gap-2 rounded-lg bg-slate-200 dark:bg-slate-700 p-1">
                                        <button onClick={() => setAccountType('personal')} className={`px-4 py-1.5 text-base rounded-md font-semibold transition-colors ${accountType === 'personal' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>شخصی</button>
                                        <button onClick={() => setAccountType('business')} className={`px-4 py-1.5 text-base rounded-md font-semibold transition-colors ${accountType === 'business' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>تجاری</button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="label">آدرس ایمیل</label>
                                    <input type="email" id="email" name="email" value={email} readOnly className="input mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed" />
                                </div>
                            </div>
                            
                            {accountType === 'business' && (
                                <div className="animate-fade-in">
                                    <label htmlFor="company" className="label">شرکت</label>
                                    <input type="text" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)} className="input mt-1" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="label">نام</label>
                                    <input type="text" id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input mt-1" />
                                </div>
                                 <div>
                                    <label htmlFor="lastName" className="label">نام خانوادگی</label>
                                    <input type="text" id="lastName" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="mobile" className="label">موبایل</label>
                                    <input type="tel" id="mobile" name="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="website" className="label">وب‌سایت</label>
                                    <input type="url" id="website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="input mt-1" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end items-center gap-4">
                             <button onClick={handleLogout} className="btn btn-secondary bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900">خروج</button>
                             <button onClick={() => setIsPasswordModalOpen(true)} className="btn btn-secondary">تغییر رمز عبور</button>
                            <button onClick={handleSaveChanges} disabled={isSaving} className="btn btn-primary w-36">
                                {isSaving ? <LoadingSpinner className="w-5 h-5" /> : 'ذخیره تغییرات'}
                            </button>
                        </div>
                    </div>
                </div>
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
                    <div className="card">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تنظیمات نمایش</h3>
                         <div className="flex justify-around items-center gap-4">
                            {themeOptions.map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => handleThemeSelect(option.key as Theme)}
                                    aria-label={`Switch to ${option.key} theme`}
                                    className={`flex-1 p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                                        theme === option.key
                                            ? 'bg-brand-50 dark:bg-slate-700/80 border-brand-500'
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
            
            {isPasswordModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-container max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">تغییر رمز عبور</h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="modal-content">
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
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setIsPasswordModalOpen(false)} className="btn btn-secondary">لغو</button>
                            <button 
                                onClick={handleChangePassword}
                                disabled={isPasswordSaving || !password.current || !password.new || !password.confirm}
                                className="btn btn-primary w-48"
                            >
                                {isPasswordSaving ? <LoadingSpinner className="w-5 h-5" /> : 'بروزرسانی رمز عبور'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}

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