import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { LoadingSpinner, UserIcon, MailIcon } from './IconComponents';

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.444-11.297-8.161l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,35.508,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const MarketingIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2"/>
        <circle cx="200" cy="200" r="140" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2"/>
        <path d="M100 280C140 230, 260 230, 300 280" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 10"/>
        <path d="M120 150L190 220L280 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M280 130L320 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="120" cy="150" r="8" fill="currentColor" fillOpacity="0.3"/>
        <circle cx="190" cy="220" r="8" fill="currentColor" fillOpacity="0.3"/>
        <circle cx="280" cy="130" r="8" fill="currentColor" fillOpacity="0.3"/>
        <path d="M180 90L185.359 105.35L201.756 108.32L189.263 118.91L193.217 134.64L180 125.9L166.783 134.64L170.737 118.91L158.244 108.32L174.641 105.35L180 90Z" fill="currentColor" fillOpacity="0.5"/>
        <path d="M80 220L82.6795 228.675L92.8786 230.16L85.6393 236.455L87.8205 246.325L80 241.45L72.1795 246.325L74.3607 236.455L67.1214 230.16L77.3205 228.675L80 220Z" fill="currentColor" fillOpacity="0.5"/>
    </svg>
);


const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup, requestPasswordReset } = useAuth();
    const { navigate } = useUI();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (mode === 'signup') {
                await signup(firstName, lastName, email, password);
            } else {
                await login(email, password);
            }
            navigate('dashboard');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await requestPasswordReset(email);
            setMode('login');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setError(null);
        setIsLoading(false);
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
    };

    const switchMode = (newMode: 'login' | 'signup' | 'reset') => {
        resetForm();
        setMode(newMode);
    };

    const renderFormContent = () => {
        if (mode === 'reset') {
            return (
                 <div className="animate-fade-in">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">بازنشانی رمز عبور</h2>
                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">لینک بازنشانی را به ایمیل خود ارسال کنید.</p>
                    <form onSubmit={handleResetSubmit} className="mt-8 space-y-6">
                        <div className="relative">
                            <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 right-4 -translate-y-1/2" />
                            <input type="email" placeholder="آدرس ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required className="input !pl-5 !pr-12" />
                        </div>
                        <button type="submit" disabled={isLoading} className="btn btn-launch w-full !py-3 text-base">
                            {isLoading ? <LoadingSpinner className="w-6 h-6"/> : 'ارسال لینک'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-base">
                        <button onClick={() => switchMode('login')} className="font-semibold text-brand-purple hover:underline">بازگشت به ورود</button>
                    </p>
                </div>
            );
        }

        const isSignup = mode === 'signup';
        return (
            <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{isSignup ? 'ایجاد حساب کاربری' : 'خوش آمدید!'}</h2>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{isSignup ? 'برای شروع ماجراجویی خود ثبت نام کنید.' : 'برای ادامه وارد حساب خود شوید.'}</p>
                
                <div className="mt-8">
                    <button className="w-full inline-flex items-center justify-center gap-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                       <GoogleIcon className="w-6 h-6"/>
                       <span className="font-semibold text-slate-700 dark:text-slate-300">ادامه با گوگل</span>
                    </button>
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="mx-4 flex-shrink text-sm text-slate-500 dark:text-slate-400">یا ادامه با ایمیل</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isSignup && (
                        <div className="grid grid-cols-2 gap-4">
                             <div className="relative">
                                <UserIcon className="w-5 h-5 text-slate-400 absolute top-1/2 right-4 -translate-y-1/2" />
                                <input type="text" placeholder="نام" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input !pl-5 !pr-12" />
                            </div>
                            <div className="relative">
                                <UserIcon className="w-5 h-5 text-slate-400 absolute top-1/2 right-4 -translate-y-1/2" />
                                <input type="text" placeholder="نام خانوادگی" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input !pl-5 !pr-12" />
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 right-4 -translate-y-1/2" />
                        <input type="email" placeholder="آدرس ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required className="input !pl-5 !pr-12" />
                    </div>
                    <div className="relative">
                        <LockIcon className="w-5 h-5 text-slate-400 absolute top-1/2 right-4 -translate-y-1/2" />
                        <input type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} required className="input !pl-5 !pr-12" />
                    </div>
                    
                    {!isSignup && (
                        <div className="text-sm text-right">
                           <button type="button" onClick={() => switchMode('reset')} className="font-medium text-brand-purple hover:underline">رمز عبور خود را فراموش کرده‌اید؟</button>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="btn btn-launch w-full !py-3 text-base">
                        {isLoading ? <LoadingSpinner className="w-6 h-6"/> : (isSignup ? 'ایجاد حساب' : 'ورود')}
                    </button>
                </form>
                
                <p className="mt-8 text-center text-base">
                    {isSignup ? 'قبلا حساب کاربری دارید؟' : 'حساب کاربری ندارید؟'}
                    <button onClick={() => switchMode(isSignup ? 'login' : 'signup')} className="font-semibold text-brand-purple hover:underline mr-2">
                        {isSignup ? 'وارد شوید' : 'ثبت نام کنید'}
                    </button>
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-white dark:bg-slate-800/50 shadow-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                {/* Left Branding Panel */}
                <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-brand-purple to-brand-pink text-white text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
                    <div className="z-10">
                        <h1 className="text-4xl font-bold">جادوی کمپین خود را آزاد کنید</h1>
                        <p className="mt-4 text-lg max-w-md opacity-90">
                            از ایده تا اجرا در چند دقیقه با دستیار هوش مصنوعی ما. به هزاران بازاریاب موفق بپیوندید.
                        </p>
                        <div className="mt-8 h-64 text-white/50">
                            <MarketingIllustration />
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="p-8 sm:p-12">
                    {error && (
                        <div className="p-3 mb-6 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm text-center animate-fade-in">
                            {error}
                        </div>
                    )}
                    {renderFormContent()}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
