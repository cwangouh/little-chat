from typing import Annotated

from app.chat.schemas import MessagePublic
from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError, NotFoundError
from app.models import Message
from fastapi import Depends
from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


class MessageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_message_by_id(self, message_id: int) -> MessagePublic | None:
        stmt = select(Message).where(Message.message_id == message_id)

        async with self.session.begin():
            result = await self.session.execute(stmt)
            res = result.scalar_one_or_none()

            if not res:
                return None

        return MessagePublic.model_validate(res)

    async def get_messages_by_chat_id(
        self,
        conversation_id: int,
    ) -> list[MessagePublic]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )

        async with self.session.begin():
            result = await self.session.execute(stmt)
            messages = result.scalars().all()

        return [MessagePublic.model_validate(m) for m in messages]

    async def create_message(
        self,
        conversation_id: int,
        user_id: int,
        text: str,
    ) -> MessagePublic:
        try:
            async with self.session.begin():
                message = Message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    text=text,
                )

                self.session.add(message)
                await self.session.flush()   # получаем message_id
                await self.session.refresh(message)

            return MessagePublic.model_validate(message)
        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="message", orig=ie.orig) from ie

    async def edit_message(
        self,
        message_id: int,
        user_id: int,
        new_text: str,
    ) -> MessagePublic:
        stmt = (
            update(Message)
            .where(
                Message.message_id == message_id,
                Message.user_id == user_id,
            )
            .values(
                text=new_text,
                is_edited=True,
            )
            .returning(Message)
        )

        try:
            async with self.session.begin():
                result = await self.session.execute(stmt)
                message = result.scalar_one_or_none()
                if message is None:
                    raise NotFoundError(entity="message", entity_id=message_id)

        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="message", orig=ie.orig) from ie

        return MessagePublic.model_validate(message)

    async def delete_message(
        self,
        message_id: int,
        user_id: int,
    ) -> None:
        stmt = (
            delete(Message)
            .where(
                Message.message_id == message_id,
                Message.user_id == user_id,
            )
        )

        try:
            async with self.session.begin():
                await self.session.execute(stmt)

        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="message", orig=ie.orig) from ie


async def get_message_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> MessageRepository:
    return MessageRepository(session)
