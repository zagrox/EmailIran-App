import React, { createContext, useState, useContext, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type: NotificationType) => void;
    removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [nextId, setNextId] = useState(0);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const id = nextId;
        setNextId(prev => prev + 1);
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 5000); // Auto-dismiss after 5 seconds
    }, [nextId]);
    
    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
