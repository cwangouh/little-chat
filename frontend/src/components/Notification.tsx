import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

export type BaseNotificationType = 'success' | 'error' | 'info' | 'warning';

export const NotificationType = {
    NEW_MESSAGE: "new_message",
    NEW_REACTION: "new_reaction"
};

interface NotificationProps {
    id: string;
    message: string;
    type?: BaseNotificationType;
    duration?: number; // в миллисекундах
    onClose: (id: string) => void;
}

const notificationIcons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
};

const notificationColors = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800'
};

export const Notification: React.FC<NotificationProps> = ({
    id,
    message,
    type = 'info',
    duration = 5000,
    onClose
}) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div
            className={clsx(
                'relative mb-3 p-4 pr-12 rounded-lg border shadow-lg transform transition-all duration-300',
                notificationColors[type],
                isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            )}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <span className="text-xl">{notificationIcons[type]}</span>
                <span className="flex-1 text-sm">{message}</span>
            </div>
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
                ✕
            </button>
        </div>
    );
};