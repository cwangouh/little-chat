import React, { createContext, useCallback, useContext, useState } from 'react';
import { type BaseNotificationType } from '../components/Notification';

interface NotificationItem {
    id: string;
    message: string;
    type: BaseNotificationType;
    duration?: number;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    showNotification: (message: string, type?: BaseNotificationType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    hideNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const showNotification = useCallback((
        message: string,
        type: BaseNotificationType = 'info',
        duration: number = 5000
    ) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

        setNotifications(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showNotification(message, 'success', duration);
    }, [showNotification]);

    const showError = useCallback((message: string, duration?: number) => {
        showNotification(message, 'error', duration);
    }, [showNotification]);

    const showInfo = useCallback((message: string, duration?: number) => {
        console.log("Showing info notification", { message, duration });
        showNotification(message, 'info', duration);
    }, [showNotification]);

    const showWarning = useCallback((message: string, duration?: number) => {
        showNotification(message, 'warning', duration);
    }, [showNotification]);

    const hideNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    console.log("Rendering NotificationProvider with notifications", notifications);

    return (
        <NotificationContext.Provider value={{
            notifications,
            showNotification,
            showSuccess,
            showError,
            showInfo,
            showWarning,
            hideNotification,
            clearAllNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};