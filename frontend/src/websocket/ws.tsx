import type { WSEvent } from "./types";


type MessageHandler = (event: WSEvent) => void;

export class WSClient {
    private socket: WebSocket | null = null;
    private handler: MessageHandler;

    constructor(handler: MessageHandler) {
        this.handler = handler;
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:8000/ws');

        this.socket.onopen = () => {
            console.log("[WS] connected");
        };

        this.socket.onmessage = (event) => {
            const data: WSEvent = JSON.parse(event.data);
            this.handler(data);
        };

        this.socket.onclose = () => {
            console.log("[WS] disconnected");
        };

        this.socket.onerror = (err) => {
            console.error("[WS] error", err);
        };
    }

    disconnect() {
        this.socket?.close();
        this.socket = null;
    }
}
