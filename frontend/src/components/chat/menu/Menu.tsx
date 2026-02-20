import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats } from '../../../contexts/ChatContext';
import { useAuthFetch } from '../../../fetches/auth';
import { CreateChatModal } from '../modals/CreateChatModal';
import { ChatElement } from './ChatElement';


function Menu() {
    const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);
    const { chats, isLoading, error, selectedChatId, setSelectedChatId } = useChats();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const handleCreateChat = async (tag: string) => {
        const response = await authFetch("http://localhost:8000/api/v1/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ tag }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "Failed to create chat");
        }

        setIsCreateChatModalOpen(false);
    };

    const handleChatClick = (chatId: number) => {
        setSelectedChatId(chatId);
        navigate(`/chat/${chatId}`);
    };

    return (
        <>
            <div className="h-full flex flex-col border border-gray-300">
                <div className="px-4 py-3 flex flex-col  border-b border-gray-300 bg-white">
                    <h3 className="text-lg text-left font-semibold text-gray-800">Chats available</h3>
                    <button
                        onClick={() => setIsCreateChatModalOpen(true)}
                        className="text-purple-600 hover:text-purple-800 font-semibold text-sm text-left hover:underline"
                    >
                        + Add chat
                    </button>
                </div>

                <div className="flex-1 flex-col overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading chats...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">
                            <p>Error: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-blue-500 hover:text-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>No chats yet</p>
                            <p className="text-sm mt-1">Click "+ Add chat" to start a conversation</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <ChatElement
                                key={chat.conversation_id}
                                chat={chat}
                                onClick={() => handleChatClick(chat.conversation_id)}
                                isSelected={selectedChatId === chat.conversation_id}
                            />
                        ))
                    )}
                </div>
            </div>

            <CreateChatModal
                isOpen={isCreateChatModalOpen}
                onClose={() => setIsCreateChatModalOpen(false)}
                onCreateChat={handleCreateChat}
            />
        </>
    );
}

export default Menu;