import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XIcon, LoadingSpinner, UserIcon } from './IconComponents';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            // On successful login, the modal is closed by the AuthContext
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setIsLoading(false);
        setEmail('');
        setPassword('');
        onClose();
    };


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
                        ورود به حساب کاربری
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
                                    placeholder="your@email.com"
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
                            {isLoading ? <LoadingSpinner className="w-5 h-5"/> : 'ورود'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;