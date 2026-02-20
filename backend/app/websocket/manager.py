import json
from typing import Any

from fastapi import WebSocket

from app.websocket.events import WSEventType


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        print("Connecting user:", user_id)
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(
        self,
        user_id: int,
        event_type: WSEventType,
        payload: dict | None = None,
        str_payload: str | None = None,
    ):
        ws = self.active_connections.get(user_id)
        if ws:
            event: dict[str, Any] = {
                "type": event_type,
            }
            if payload is not None:
                event["payload"] = payload

            if str_payload is not None:
                payload = json.loads(str_payload)
                event["payload"] = payload

            await ws.send_json(event)


ws_manager = ConnectionManager()
