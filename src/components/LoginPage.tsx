import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { LoadingSpinner, UserIcon, MailIcon } from './IconComponents';

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
            navigate('dashboard'); // Navigate on success
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
            setMode('login'); // switch back after request
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

    if (mode === 'reset') {
        return (
            <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-800/50 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 ring-1 ring-black/5 dark:ring-white/10">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                                <MailIcon className="w-7 h-7 text-brand-purple" />
                                بازنشانی رمز عبور
                            </h2>
                             <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                                ایمیل خود را وارد کنید تا لینک بازنشانی را برای شما ارسال کنیم.
                            </p>
                        </div>
                        <form onSubmit={handleResetSubmit}>
                            {error && (
                                <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="label">آدرس ایمیل</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input mt-1"
                                />
                            </div>
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn btn-primary py-3 text-base"
                                >
                                    {isLoading ? <LoadingSpinner className="w-5 h-5"/> : 'ارسال لینک بازنشانی'}
                                </button>
                            </div>
                        </form>
                         <div className="text-center">
                            <button type="button" onClick={() => switchMode('login')} className="text-base text-brand-purple hover:underline focus:outline-none">
                                بازگشت به صفحه ورود
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isSignup = mode === 'signup';

    return (
        <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800/50 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 ring-1 ring-black/5 dark:ring-white/10">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                            <UserIcon className="w-7 h-7 text-brand-purple" />
                            {isSignup ? 'ایجاد حساب کاربری' : 'ورود به حساب کاربری'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}
                            {isSignup && (
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="firstName" className="label">نام</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className="input mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="label">نام خانوادگی</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            className="input mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="label">آدرس ایمیل</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input mt-1"
                                />
                            </div>
                             <div>
                                <label htmlFor="password" className="label">رمز عبور</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input mt-1"
                                />
                            </div>
                            {mode === 'login' && (
                                <div className="text-right text-sm">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('reset')}
                                        className="font-medium text-brand-purple hover:underline"
                                    >
                                        رمز عبور خود را فراموش کرده‌اید؟
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn btn-primary py-3 text-base"
                            >
                                {isLoading ? <LoadingSpinner className="w-5 h-5"/> : (isSignup ? 'ثبت‌نام و ورود' : 'ورود')}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <button type="button" onClick={() => switchMode(isSignup ? 'login' : 'signup')} className="text-base text-brand-purple hover:underline focus:outline-none">
                            {isSignup ? 'قبلاً حساب کاربری دارید؟ وارد شوید' : 'حساب کاربری ندارید؟ ثبت‌نام کنید'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;