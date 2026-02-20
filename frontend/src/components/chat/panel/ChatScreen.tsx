import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useChats } from "../../../contexts/ChatContext";
import { useMessages } from "../../../contexts/MessageContext";
import { useUser } from "../../../contexts/UserContext";
import { WebSocketContext } from "../../../contexts/WebSocketContext";
import { WSEventType, type WSEvent } from "../../../websocket/types";
import { WSClient } from "../../../websocket/ws";
import Menu from "../menu/Menu";
import Header from "./Header";

function ChatScreen() {
    const { refreshUser } = useUser();
    const { refreshChats, addChat, removeChat } = useChats();
    const { handleWSEvent: handleMessageWSEvent } = useMessages();
    const [wsClient, setWsClient] = useState<WSClient | null>(null);

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
                break;

            default:
                console.warn("Unhandled WS event", event);
        }
    };

    return (
        <WebSocketContext.Provider value={wsClient}>
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
