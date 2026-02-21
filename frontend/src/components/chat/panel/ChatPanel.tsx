import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChats, type Chat } from '../../../contexts/ChatContext';
import { useMessages, type Message } from '../../../contexts/MessageContext';
import { useUser, type User } from '../../../contexts/UserContext';
import OtherProfileModal from '../modals/OtherProfileModal';
import { TextMessage } from './Message';

interface ChatHeaderProps {
    chat: Chat | null,
    otherUser: User | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, otherUser }) => {
    const otherUserName = otherUser ? `${otherUser.first_name} ${otherUser.surname}` : chat ? chat.title : "";
    const [isOtherProfileOpen, setIsOtherProfileOpen] = useState(false);

    return (
        <>
            <div className="min-h-12 w-full px-4 border-b border-gray-300 shadow-sm flex items-center">
                <span className="font-bold text-lg">{otherUserName}</span>
                {
                    otherUser && (
                        <button
                            onClick={() => setIsOtherProfileOpen(true)}
                            className='
                    ml-1.5 text-2xl text-gray-300 hover:text-gray-500
                    hover:translate-x-0.5 transition-all duration-200
                    '
                            title="Open profile"
                        >
                            ￫
                        </button>
                    )
                }
            </div>
            {
                isOtherProfileOpen && (
                    <OtherProfileModal onClose={() => setIsOtherProfileOpen(false)} profile={otherUser} />
                )
            }
        </>
    );
};

interface ConversationProps {
    messages: Message[];
    currentUserId: number;
    onEditMessage?: (messageId: number, newText: string) => void;
    onDeleteMessage?: (messageId: number) => void;
}

export const Conversation: React.FC<ConversationProps> = ({
    messages,
    currentUserId,
    onEditMessage,
    onDeleteMessage,
}) => {
    if (messages.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                </div>
            </div>
        );
    }


    return (
        <div className="h-full px-4 py-3 overflow-y-auto bg-gray-50">
            <div className="flex flex-col space-y-3">
                {messages.map(message => {
                    return <TextMessage
                        messageId={message.message_id}
                        text={message.text}
                        created_at={message.created_at}
                        is_edited={message.is_edited}
                        is_my={message.user_id === currentUserId}
                        reactions={message.reactions}
                        onEdit={(newText) => onEditMessage?.(message.message_id, newText)}
                        onDelete={() => onDeleteMessage?.(message.message_id)}
                    />
                })}
            </div>
        </div>
    );
};


interface InputPanelProps {
    onSendMessage: (text: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-300">
            <div className="flex items-end px-4 py-3 bg-white">
                <div className="flex-1 mr-3">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-y-auto max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={1}
                        placeholder="Type your message..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </div>
        </form>
    );
};

export const ChatPanelPlaceholder: React.FC = () => {
    return <>
        <div className="min-w-45 border-1 border-l-0 border-gray-300 flex-1">
            <div className="h-full flex flex-col justify-center">
                <span className="text-4xl font-bold text-gray-400">Choose a chat</span>
            </div>
        </div>
    </>
}

export const ChatPanel: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const { error, chats, selectedChatId, setSelectedChatId, otherUserDetails, loadOtherUserDetails } = useChats();
    const { messages, isLoading, loadMessages, sendMessage, deleteMessage, editMessage } = useMessages();
    const { currentUser } = useUser();

    const chatDetails = chats.find((ch) => ch.conversation_id == selectedChatId);

    useEffect(() => {
        if (!chatId) return;
        loadMessages(Number(chatId));
        setSelectedChatId(Number(chatId));

        if (chatDetails) {
            const otherUserId =
                chatDetails.user_id === currentUser?.user_id
                    ? chatDetails.user_id2
                    : chatDetails.user_id;

            loadOtherUserDetails(otherUserId);
        }
    }, [chatId]);

    if (!chatId) return <ChatPanelPlaceholder />;

    if (isLoading) {
        return (
            <div className="min-w-45 border-l border-gray-300 flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error || !chatDetails) {
        return (
            <div className="min-w-45 border-l border-gray-300 flex-1 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p>{error || 'Chat not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-w-45 border-l border-gray-300 flex-1 flex flex-col">
            <ChatHeader chat={chatDetails ? chatDetails : null} otherUser={otherUserDetails} />

            <div className="flex-1 overflow-hidden">
                <Conversation
                    messages={messages}
                    currentUserId={currentUser?.user_id || -1}
                    onDeleteMessage={(messageId) => deleteMessage(selectedChatId ? selectedChatId : -1, messageId)}
                    onEditMessage={(messageId, text) => editMessage(selectedChatId ? selectedChatId : -1, messageId, text)}
                />
            </div>

            <InputPanel onSendMessage={(text) => sendMessage(Number(chatId), text)} />
        </div>
    );
};


export default ChatPanel;