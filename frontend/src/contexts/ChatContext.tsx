import React, { createContext, useContext, useState } from 'react';
import { useAuthFetch } from '../fetches/auth';
import type { User } from './UserContext';

export interface Chat {
    conversation_id: number;
    title: string | null;
    user_id: number;
    user_id2: number;
    last_message?: string;
    last_message_time?: string;
    unread_count?: number;
}

interface ChatsContextType {
    chats: Chat[];
    isLoading: boolean;
    error: string | null;

    addChat: (chat: Chat) => void;
    removeChat: (conversationId: number) => void;
    updateChat: (conversationId: number, updates: Partial<Chat>) => void;

    refreshChats: () => Promise<void>;

    selectedChatId: number | null;
    setSelectedChatId: (id: number | null) => void;
    otherUserDetails: User | null;
    loadOtherUserDetails: (otherUserId: number) => Promise<void>;
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const useChats = () => {
    const ctx = useContext(ChatsContext);
    if (!ctx) {
        throw new Error('useChats must be used within ChatsProvider');
    }
    return ctx;
};

export const ChatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [otherUserDetails, setOtherUserDetails] = useState<User | null>(null);

    const authFetch = useAuthFetch();

    const refreshChats = async () => {
        setIsLoading(true);
        setError(null);

        console.log("Refreshing chats...");

        try {
            const response = await authFetch('http://localhost:8000/api/v1/chat', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to load chats');
            }

            const data = await response.json();
            setChats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load chats');
        } finally {
            setIsLoading(false);
        }
    };

    const addChat = (chat: Chat) => {
        setChats(prev => {
            if (prev.some(c => c.conversation_id === chat.conversation_id)) {
                return prev;
            }
            return [chat, ...prev];
        });
    };

    const removeChat = (conversationId: number) => {
        setChats(prev => prev.filter(c => c.conversation_id !== conversationId));
        setSelectedChatIdWrapper(selectedChatId === conversationId ? null : selectedChatId);
    };

    const updateChat = (conversationId: number, updates: Partial<Chat>) => {
        setChats(prev =>
            prev.map(chat =>
                chat.conversation_id === conversationId
                    ? { ...chat, ...updates }
                    : chat
            )
        );
    };

    const loadOtherUserDetails = async (otherUserId: number) => {
        try {
            const response = await authFetch(
                `http://localhost:8000/api/v1/user/id/${otherUserId}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                setOtherUserDetails(null);
                throw new Error('Failed to load user details');
            }

            const userData: User = await response.json();
            setOtherUserDetails(userData);
        } catch (err) {
            console.error('Error loading user details:', err);
            setOtherUserDetails(null);
        }
    };

    const setSelectedChatIdWrapper = (id: number | null) => {
        setSelectedChatId(id);
    };

    return (
        <ChatsContext.Provider
            value={{
                chats,
                isLoading,
                error,
                addChat,
                removeChat,
                updateChat,
                refreshChats,
                selectedChatId,
                setSelectedChatId: setSelectedChatIdWrapper,
                otherUserDetails,
                loadOtherUserDetails,
            }}
        >
            {children}
        </ChatsContext.Provider>
    );
};
