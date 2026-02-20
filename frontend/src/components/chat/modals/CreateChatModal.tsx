// components/CreateChatModal.tsx
import React, { useEffect, useState } from 'react';
import { useAuthFetch } from '../../../fetches/auth';
import { BasicModal } from '../../Common';

interface User {
    user_id: number;
    first_name: string;
    surname: string;
    tag: string;
}

interface CreateChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateChat: (tag: string) => Promise<void>;
}

export const CreateChatModal: React.FC<CreateChatModalProps> = ({
    isOpen,
    onClose,
    onCreateChat
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const authFetch = useAuthFetch();

    useEffect(() => {
        const searchUser = async () => {
            if (!searchQuery.trim()) {
                setFoundUser(null);
                return;
            }

            setIsSearching(true);
            setError('');

            try {
                const response = await authFetch(
                    `http://localhost:8000/api/v1/user/tag/${searchQuery.trim()}`, {
                    credentials: 'include',
                }
                );

                console.log('Search response:', response);

                if (response.ok) {
                    const user = await response.json();
                    setFoundUser(user);
                } else if (response.status === 404) {
                    setFoundUser(null);
                    setError('User not found');
                } else {
                    setFoundUser(null);
                    setError('Search failed');
                }
            } catch (err) {
                setFoundUser(null);
                setError('Search error');
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchUser, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreateChat = async () => {
        if (!foundUser || isCreating) return;

        setIsCreating(true);
        setError('');

        try {
            await onCreateChat(foundUser.tag);
            onClose();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to create chat');
            }
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <BasicModal onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">New Chat</h2>

                <div className="mb-3">
                    <p className="text-gray-600 mb-1 text-left">Enter the tag:</p>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by username or name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isCreating}
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </div>

                {foundUser && (
                    <div className="mb-6">
                        <div
                            onClick={handleCreateChat}
                            className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-bold">
                                        {foundUser.first_name.charAt(0)}{foundUser.surname.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {foundUser.first_name} {foundUser.surname}
                                    </p>
                                    <p className="text-gray-500 text-sm">@{foundUser.tag}</p>
                                </div>
                                {isCreating && (
                                    <div className="ml-auto">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={isCreating}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateChat}
                        disabled={!foundUser || isCreating}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? 'Creating...' : 'Create Chat'}
                    </button>
                </div>
            </div>
        </BasicModal>
    );
};