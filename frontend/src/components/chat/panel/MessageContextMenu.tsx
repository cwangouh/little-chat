import React, { useEffect, useRef } from 'react';
import { emojis, getReactionTypeByEmoji } from '../../../contexts/MessageContext';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddReact: (emoji: string) => void;
    isOwnMessage: boolean;
}

export const MessageContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    onClose,
    onEdit,
    onDelete,
    onAddReact,
    isOwnMessage: isMyMessage
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
            style={{ left: Math.min(x, window.innerWidth - 200), top: y }}
        >
            <div className="px-2 py-1 border-b border-gray-100">
                <div className="flex justify-around gap-1">
                    {emojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onAddReact(getReactionTypeByEmoji(emoji));
                                onClose();
                            }}
                            className="w-8 h-8 hover:bg-gray-100 rounded-full text-lg transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {isMyMessage && (
                <>
                    <button
                        onClick={() => {
                            onEdit();
                            onClose();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                    >
                        <span>✏️</span>
                        Edit message
                    </button>

                    <button
                        onClick={() => {
                            onDelete();
                            onClose();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 text-sm flex items-center gap-2"
                    >
                        <span>🗑️</span>
                        Delete message
                    </button>
                </>
            )}
        </div>
    );
};