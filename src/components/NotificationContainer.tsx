import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
// FIX: Imported SparklesIcon from the central IconComponents file to resolve the block-scoped variable error.
import { CheckCircleIcon, XCircleIcon, XIcon, SparklesIcon } from './IconComponents';

const iconMap = {
    success: <CheckCircleIcon className="w-6 h-6" />,
    error: <XCircleIcon className="w-6 h-6" />,
    info: <SparklesIcon className="w-6 h-6" />, // Re-using for general info
};

const iconClassMap = {
    success: 'toast-icon-success',
    error: 'toast-icon-error',
    info: 'toast-icon-info',
};

const toastClassMap = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
};

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <div 
            aria-live="assertive" 
            className="fixed inset-0 flex items-start px-4 py-6 pointer-events-none sm:p-6 z-[100]"
        >
            <div className="w-full flex flex-col items-end space-y-4">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`toast ${toastClassMap[notification.type]} animate-toast-in pointer-events-auto`}
                        role="alert"
                    >
                        <div className={`toast-icon ${iconClassMap[notification.type]}`}>
                             {iconMap[notification.type]}
                        </div>
                        <div className="mr-3 text-base font-normal flex-grow">{notification.message}</div>
                        <button 
                            onClick={() => removeNotification(notification.id)}
                            type="button" 
                            className="-mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
                        >
                            <span className="sr-only">بستن</span>
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// FIX: Removed the redundant local declaration of SparklesIcon.

export default NotificationContainer;
