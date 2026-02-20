import { createContext, useContext } from "react";
import { WSClient } from "../websocket/ws";

export const WebSocketContext = createContext<WSClient | null>(null);

export const useWS = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
        throw new Error("useWS must be used inside WebSocketContext");
    }
    return ctx;
};
