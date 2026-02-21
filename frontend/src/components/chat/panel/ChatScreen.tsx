import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useChats } from "../../../contexts/ChatContext";
import { getEmojiByReactionType, useMessages } from "../../../contexts/MessageContext";
import { useNotification } from "../../../contexts/NotificationContext";
import { useUser } from "../../../contexts/UserContext";
import { WebSocketContext } from "../../../contexts/WebSocketContext";
import { WSEventType, type WSEvent } from "../../../websocket/types";
import { WSClient } from "../../../websocket/ws";
import { Notification, NotificationType } from "../../Notification";
import Menu from "../menu/Menu";
import Header from "./Header";

function ChatScreen() {
    const { refreshUser } = useUser();
    const { refreshChats, addChat, removeChat } = useChats();
    const { handleWSEvent: handleMessageWSEvent } = useMessages();
    const [wsClient, setWsClient] = useState<WSClient | null>(null);
    const { notifications, hideNotification, showInfo } = useNotification();

    useEffect(() => {
        refreshUser();
        refreshChats();
    }, []);

    useEffect(() => {
        const client = new WSClient(handleEvent);
        client.connect();
        setWsClient(client);

        return () => {
            client.disconnect();
        };
    }, []);

    const handleEvent = (event: WSEvent) => {
        console.log("Received WS event", event);
        switch (event.type) {
            case WSEventType.CHAT_CREATED:
                addChat(event.payload);
                break;

            case WSEventType.CHAT_DELETED:
                removeChat(event.payload.conversation_id);
                break;

            case WSEventType.MESSAGE_CREATED:
                handleMessageWSEvent(event);
                break;

            case WSEventType.MESSAGE_UPDATED:
                handleMessageWSEvent(event);
                break;

            case WSEventType.MESSAGE_DELETED:
                handleMessageWSEvent(event);
                break;

            case WSEventType.REACTION_ADDED:
                handleMessageWSEvent(event);
                break;

            case WSEventType.REACTION_REMOVED:
                handleMessageWSEvent(event);
                break;

            case WSEventType.NOTIFICATION:
                console.log("Received notification event", event);
                const payload = event.payload;
                if (payload.event_type === NotificationType.NEW_MESSAGE) {
                    const text: string = payload.text.length > 100 ? payload.text.substring(0, 100) + "..." : payload.text;
                    showInfo(`New message in chat ${payload.chat_name} from @${payload.sender_tag}: ${text}`, 5000);
                } else if (payload.event_type === NotificationType.NEW_REACTION) {
                    const emoji = getEmojiByReactionType(payload.reaction_type);
                    showInfo(`New reaction in chat ${payload.chat_name} from @${payload.sender_tag}: ${emoji}`, 5000);
                }
                break;

            default:
                console.warn("Unhandled WS event", event);
        }
    };

    return (
        <WebSocketContext.Provider value={wsClient}>
            <div className="fixed top-4 right-4 z-100 w-80 max-w-full pointer-events-none">
                <div className="pointer-events-auto">
                    {notifications.map(notification => (
                        <Notification
                            key={notification.id}
                            id={notification.id}
                            message={notification.message}
                            type={notification.type}
                            duration={notification.duration}
                            onClose={hideNotification}
                        />
                    ))}
                </div>
            </div>
            <div className="flex flex-col h-screen">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Menu />
                    <Outlet />
                </div>
            </div>
        </WebSocketContext.Provider>
    );
}

export default ChatScreen;
