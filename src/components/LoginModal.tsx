import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XIcon, LoadingSpinner, UserIcon } from './IconComponents';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();

    if (!isOpen) return null;

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
            // On successful login/signup, the modal is closed by the AuthContext
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

    const handleClose = () => {
        resetForm();
        setMode('login'); // Reset to login view when modal is closed
        onClose();
    };

    const toggleMode = () => {
        resetForm();
        setMode(prev => prev === 'login' ? 'signup' : 'login');
    };

    const isSignup = mode === 'signup';

    return (
        <div
            className="modal-overlay"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="modal-container max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserIcon className="w-7 h-7 text-brand-purple" />
                        {isSignup ? 'ایجاد حساب کاربری' : 'ورود به حساب کاربری'}
                    </h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-content">
                        {error && (
                            <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
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
                        </div>
                        <div className="mt-6 text-center">
                            <button type="button" onClick={toggleMode} className="text-base text-brand-purple hover:underline focus:outline-none">
                                {isSignup ? 'قبلاً حساب کاربری دارید؟ وارد شوید' : 'حساب کاربری ندارید؟ ثبت‌نام کنید'}
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-secondary"
                        >
                            لغو
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-32"
                        >
                            {isLoading ? <LoadingSpinner className="w-5 h-5"/> : (isSignup ? 'ثبت‌نام' : 'ورود')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;