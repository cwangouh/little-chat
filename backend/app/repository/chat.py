from typing import Annotated

from app.chat.schemas import ChatPreview, CreateChatResponse
from app.db import get_async_session
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_chat(
        self, title: str, user_id: int, user_id2: int
    ) -> CreateChatResponse:
        raise NotImplementedError()

    async def get_chats_by_user_id(self, user_id: int) -> list[ChatPreview]:
        raise NotImplementedError()

    async def delete_chat_by_id(self, chat_id: int) -> None:
        raise NotImplementedError()

    async def get_chat_by_id(self, chat_id: int):
        raise NotImplementedError()


async def get_chat_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> ChatRepository:
    return ChatRepository(session)
