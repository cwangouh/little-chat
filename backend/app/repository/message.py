from typing import Annotated

from app.chat.schemas import MessagePublic
from app.db import get_async_session
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


class MessageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_messages(self, conversation_id: int) -> list[MessagePublic]:
        raise NotImplementedError()


async def get_message_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> MessageRepository:
    return MessageRepository(session)
