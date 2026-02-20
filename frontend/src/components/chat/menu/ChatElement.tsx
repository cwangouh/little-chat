import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats, type Chat } from '../../../contexts/ChatContext';
import { useAuthFetch } from '../../../fetches/auth';

interface ChatElementProps {
    chat: Chat;
    onClick: () => void;
    isSelected: boolean;
}

export const ChatElement: React.FC<ChatElementProps> = ({ chat, onClick, isSelected }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { removeChat } = useChats();
    const authFetch = useAuthFetch();
    const navigate = useNavigate();

    const displayName = chat.title;
    const previewText = chat.last_message || 'No messages yet';
    const unreadCount = chat.unread_count || 0;

    const formattedTime = chat.last_message_time
        ? formatTime(chat.last_message_time)
        : '';

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);

        try {
            const response = await authFetch(
                `http://localhost:8000/api/v1/chat/${chat.conversation_id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                navigate('/chat');
            } else {
                throw new Error('Failed to delete chat');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div
            onClick={onClick}
            className={`
                relative group flex flex-col pl-4 pr-2 py-3 border-b border-gray-300 
                hover:bg-gray-100 cursor-pointer transition-colors
                ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            `}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 truncate">
                            {displayName}
                        </span>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {/* <p className="text-left text-gray-600 text-sm truncate">
                        {previewText}
                    </p> */}
                </div>

                <div className="flex items-center gap-2">
                    {/* {formattedTime && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formattedTime}
                        </span>
                    )} */}

                    <button
                        onClick={handleDeleteClick}
                        className="
                            ml-1 opacity-0 group-hover:opacity-100
                            text-gray-400 hover:text-red-500
                            p-1 rounded-full hover:bg-gray-200
                            transition-all duration-200
                            text-xs
                        "
                        title="Delete chat"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Delete Chat?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete this chat? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const formatTime = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    } catch {
        return '';
    }
};