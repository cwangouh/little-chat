from app.db import get_async_session
from app.websocket.dependencies import get_current_user_ws
from app.websocket.manager import ws_manager
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

ws_router = APIRouter()


@ws_router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    session: AsyncSession = Depends(get_async_session),
):
    token_cookie = websocket.cookies.get("jwt")
    if not token_cookie:
        await websocket.close(code=1008)
        return

    token = token_cookie.removeprefix("Bearer ").strip()

    user = await get_current_user_ws(token, session)
    if not user:
        await websocket.close(code=1008)
        return

    await ws_manager.connect(user.user_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(user.user_id)
