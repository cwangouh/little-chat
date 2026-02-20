import React, { createContext, useContext, useState } from "react";
import { useAuthFetch } from "../fetches/auth";
import { WSEventType, type WSEvent } from "../websocket/types";



const ReactionType = {
    LIKE: "like",
    LAUGH: "laugh",
    SAD: "sad",
    HEART: "heart",
    EMBARRASSED: "embarrassed"
};

export const getReactionTypeByEmoji = (emoji: string): string => {
    switch (emoji) {
        case '👍':
            return ReactionType.LIKE;
        case '❤️':
            return ReactionType.HEART;
        case '😄':
            return ReactionType.LAUGH;
        case '😢':
            return ReactionType.SAD;
        case '😮':
            return ReactionType.EMBARRASSED;
        default:
            return '';
    }
};

export const getEmojiByReactionType = (reactionType: string): string => {
    switch (reactionType) {
        case ReactionType.LIKE:
            return '👍';
        case ReactionType.HEART:
            return '❤️';
        case ReactionType.LAUGH:
            return '😄';
        case ReactionType.SAD:
            return '😢';
        case ReactionType.EMBARRASSED:
            return '😮';
        default:
            return '';
    }
};

export const emojis = ['👍', '❤️', '😄', '😢', '😮'];

export interface Reaction {
    reaction_id: number;
    reaction_type: keyof typeof ReactionType;
    user_id: number;
    message_id: number;
}

export interface Message {
    message_id: number;
    text: string;
    user_id: number;
    created_at: string;
    is_edited: boolean;
    conversation_id: number;
    reactions: Reaction[]
}

interface MessagesContextType {
    messages: Message[];
    isLoading: boolean;
    error: string | null;

    loadMessages: (chatId: number) => Promise<void>;
    sendMessage: (chatId: number, text: string) => Promise<void>;
    deleteMessage: (chatId: number, messageId: number) => Promise<void>;
    editMessage: (chatId: number, messageId: number, text: string) => Promise<void>;
    addReaction: (messageId: number, reactionType: string) => Promise<void>;
    removeReaction: (messageId: number, reactionId: number) => Promise<void>;
    handleWSEvent: (event: any) => void;
}

const MessagesContext = createContext<MessagesContextType | null>(null);

export const useMessages = () => {
    const ctx = useContext(MessagesContext);
    if (!ctx) throw new Error("useMessages must be used inside MessagesProvider");
    return ctx;
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const authFetch = useAuthFetch();

    const loadMessages = async (chatId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await authFetch(
                `http://localhost:8000/api/v1/chat/${chatId}/message`,
                { credentials: "include" }
            );

            if (!res.ok) throw new Error("Failed to load messages");

            const data = await res.json();
            setMessages(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (chatId: number, text: string) => {
        const res = await authFetch(
            `http://localhost:8000/api/v1/chat/${chatId}/message`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text }),
            }
        );

        if (!res.ok) throw new Error("Failed to send message");
    };

    const deleteMessage = async (chatId: number, messageId: number) => {
        const res = await authFetch(
            `http://localhost:8000/api/v1/chat/${chatId}/message/${messageId}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        if (!res.ok) throw new Error("Failed to delete message");
    };

    const editMessage = async (chatId: number, messageId: number, text: string) => {
        const res = await authFetch(
            `http://localhost:8000/api/v1/chat/${chatId}/message/${messageId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text }),
            }
        );

        if (!res.ok) throw new Error("Failed to edit message");
    };

    const addReaction = async (messageId: number, reactionType: string) => {
        const res = await authFetch(
            `http://localhost:8000/api/v1/message/${messageId}/reaction`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reaction_type: reactionType }),
            }
        );

        if (!res.ok) throw new Error("Failed to add reaction");
    };

    const removeReaction = async (messageId: number, reactionId: number) => {
        const res = await authFetch(
            `http://localhost:8000/api/v1/message/${messageId}/reaction/${reactionId}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        if (!res.ok) throw new Error("Failed to remove reaction");
    };

    const handleWSEvent = (event: WSEvent) => {
        switch (event.type) {
            case WSEventType.MESSAGE_CREATED:
                setMessages(prev => [...prev, event.payload]);
                break;

            case WSEventType.MESSAGE_UPDATED:
                setMessages(prev =>
                    prev.map(m =>
                        m.message_id === event.payload.message_id
                            ? { ...m, text: event.payload.text, is_edited: true }
                            : m
                    )
                );
                break;

            case WSEventType.MESSAGE_DELETED:
                setMessages(prev =>
                    prev.filter(m => m.message_id !== event.payload.message_id)
                );
                break;

            case WSEventType.REACTION_ADDED:
                setMessages(prev =>
                    prev.map(m =>
                        m.message_id === event.payload.message_id
                            ? {
                                ...m,
                                reactions: [...m.reactions, event.payload],
                            }
                            : m
                    )
                );
                break;

            case WSEventType.REACTION_REMOVED:
                setMessages(prev =>
                    prev.map(m =>
                        m.message_id === event.payload.message_id
                            ? {
                                ...m,
                                reactions: m.reactions.filter(
                                    r => r.reaction_id !== event.payload.reaction_id
                                ),
                            }
                            : m
                    )
                );
                break;

            default:
                console.warn("Unhandled WS event type:", event.type);
        }
    };

    return (
        <MessagesContext.Provider
            value={{
                messages,
                isLoading,
                error,
                loadMessages,
                sendMessage,
                deleteMessage,
                editMessage,
                addReaction,
                removeReaction,
                handleWSEvent,
            }}
        >
            {children}
        </MessagesContext.Provider>
    );
};
