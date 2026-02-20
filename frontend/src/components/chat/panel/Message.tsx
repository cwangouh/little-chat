import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { getEmojiByReactionType, useMessages, type Reaction } from '../../../contexts/MessageContext';
import { MessageContextMenu } from './MessageContextMenu';

export const formatMessageTime = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '';
    }
};

interface MessageProps {
    messageId: number;
    is_my: boolean;
    reactions?: Reaction[];
    children?: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
}

const Message: React.FC<MessageProps> = ({
    messageId,
    is_my,
    reactions = [],
    children,
    onEdit,
    onDelete,
}) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const { addReaction } = useMessages();

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();

        const x = e.clientX;
        const y = e.clientY;

        setContextMenu({ x, y });
    };

    return (
        <>
            <div
                ref={messageRef}
                onContextMenu={handleContextMenu}
                className={clsx(
                    "w-full mb-3 flex",
                    !is_my ? "flex-row-reverse" : "flex-row"
                )}
            >
                <div className={clsx(
                    "min-w-40 max-w-sm px-3 py-2 rounded-lg shadow-sm flex flex-row gap-1 relative group",
                    is_my
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-amber-100 text-gray-800 rounded-bl-none"
                )}>
                    <div>
                        {children}
                        {reactions.length > 0 && (
                            <div className={clsx(
                                "flex items-center gap-1 mt-1 flex-wrap",
                                is_my ? "justify-end" : "justify-start"
                            )}>
                                {reactions.map((reaction) => (
                                    <div
                                        key={reaction.reaction_id}
                                        className="flex items-center gap-1 text-xs bg-white border border-gray-200 px-1 rounded"
                                    >
                                        <span>{getEmojiByReactionType(reaction.reaction_type)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = messageRef.current?.getBoundingClientRect();
                            if (rect) {
                                setContextMenu({
                                    x: rect.left + 200,
                                    y: rect.top
                                });
                            }
                        }}
                        className="
                            opacity-0 group-hover:opacity-100
                            absolute -right-6 top-1/2 -translate-y-1/2
                            w-6 h-6 flex items-center justify-center
                            bg-gray-200 hover:bg-gray-300
                            rounded-full text-gray-600
                            transition-all duration-200
                            text-sm
                        "
                    >
                        ⋮
                    </button>
                </div>
            </div>

            {contextMenu && (
                <MessageContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onEdit={onEdit || (() => { })}
                    onDelete={onDelete || (() => { })}
                    onAddReact={(emoji) => addReaction(messageId, emoji)}
                    isOwnMessage={is_my}
                />
            )}
        </>
    );
};

interface TextMessageProps {
    messageId: number;
    text: string;
    is_my: boolean;
    created_at?: string;
    is_edited?: boolean;
    reactions?: Reaction[];
    onEdit?: (newText: string) => void;
    onDelete?: () => void;
    onReact?: (emoji: string) => void;
}

export const TextMessage: React.FC<TextMessageProps> = ({
    messageId,
    text,
    is_my,
    created_at,
    is_edited = false,
    reactions = [],
    onEdit,
    onDelete,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const inputRef = useRef<HTMLInputElement>(null);

    const formattedTime = created_at ? formatMessageTime(created_at) : '';

    const handleEdit = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleSaveEdit = () => {
        if (editText.trim() && editText !== text) {
            onEdit?.(editText);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditText(text);
        }
    };

    return (
        <Message
            messageId={messageId}
            is_my={is_my}
            reactions={reactions}
            onEdit={handleEdit}
            onDelete={onDelete}
        >
            <div className="w-full">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className={clsx(
                                "w-full px-2 py-1 rounded border",
                                is_my
                                    ? "bg-blue-400 text-white border-blue-300"
                                    : "bg-white text-gray-800 border-gray-300"
                            )}
                        />
                        <div className="flex gap-2 text-xs">
                            <span>↵ to save</span>
                            <span>esc to cancel</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-1 break-words text-left">
                            <span>{text}</span>
                        </div>

                        <div className={clsx(
                            "flex items-center text-xs",
                            is_my ? "text-blue-100" : "text-gray-500"
                        )}>
                            {is_edited && (
                                <span className="italic mr-1">edited</span>
                            )}
                            {created_at && (
                                <span>{formattedTime}</span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Message>
    );
};

