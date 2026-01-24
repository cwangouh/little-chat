from typing import Annotated

from app.chat.schemas import ChatPublic
from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError, NotFoundError
from app.models import Chat, Conversation, ConversationType
from fastapi import Depends
from sqlalchemy import delete, insert, or_, select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_chat(
        self, title: str, user_id: int, user_id2: int
    ) -> ChatPublic | None:
        try:
            async with self.session.begin():
                # Check if chat already exists
                exists_stmt = select(Chat).where(
                    or_(
                        (Chat.user_id == user_id) & (
                            Chat.user_id2 == user_id2),
                        (Chat.user_id == user_id2) & (
                            Chat.user_id2 == user_id),
                    )
                )

                existing_chat = (await self.session.execute(exists_stmt)).scalar_one_or_none()
                if existing_chat:
                    return None

                # 1. Create Conversation
                conv_stmt = (
                    insert(Conversation)
                    .values(type=ConversationType.CHAT, title=title)
                    .returning(Conversation)
                )
                conv = (await self.session.execute(conv_stmt)).scalar_one()

                # 2. Create Chat
                chat_stmt = insert(Chat).values(
                    conversation_id=conv.conversation_id,
                    user_id=user_id,
                    user_id2=user_id2,
                )
                await self.session.execute(chat_stmt)

        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="chat", orig=ie.orig) from ie

        return ChatPublic(
            conversation_id=conv.conversation_id,
            title=conv.title,
            user_id=user_id,
            user_id2=user_id2,
        )

    async def get_chats_by_user_id(self, user_id: int) -> list[ChatPublic]:
        stmt = (
            select(
                Chat.conversation_id,
                Chat.user_id,
                Chat.user_id2,
                Conversation.title,
            )
            .join(Conversation, Conversation.conversation_id == Chat.conversation_id)
            .where(
                (Chat.user_id == user_id) | (Chat.user_id2 == user_id)
            )
            .order_by(Conversation.created_at.desc())
        )

        async with self.session.begin():
            result = await self.session.execute(stmt)

        chats: list[ChatPublic] = []
        for row in result.all():
            chats.append(
                ChatPublic(
                    conversation_id=row.conversation_id,
                    title=row.title,
                    user_id=row.user_id,
                    user_id2=row.user_id2,
                )
            )

        return chats

    async def delete_chat_by_id(self, chat_id: int) -> None:
        stmt = delete(Conversation).where(
            Conversation.conversation_id == chat_id
        ).returning(Conversation.conversation_id)

        try:
            async with self.session.begin():
                result = await self.session.execute(stmt)
                deleted_id = result.scalar_one_or_none()

                if deleted_id is None:
                    raise NotFoundError(entity="chat", entity_id=chat_id)

        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="chat", orig=ie.orig) from ie

    async def get_chat_by_id(self, chat_id: int) -> ChatPublic:
        stmt = (
            select(Chat, Conversation)
            .join(Conversation, Conversation.conversation_id == Chat.conversation_id)
            .where(Chat.conversation_id == chat_id)
        )

        async with self.session.begin():
            result = await self.session.execute(stmt)
            row = result.first()

            if not row:
                raise NotFoundError(entity="chat", entity_id=chat_id)

            chat, conversation = row

        return ChatPublic(
            conversation_id=conversation.conversation_id,
            title=conversation.title,
            user_id=chat.user_id,
            user_id2=chat.user_id2,
        )


async def get_chat_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> ChatRepository:
    return ChatRepository(session)
