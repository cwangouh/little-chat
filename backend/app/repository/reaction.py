from typing import Annotated

from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.message.schemas import ReactionPublic
from app.models import Reaction
from fastapi import Depends
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


class ReactionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_reaction_by_id(self, reaction_id: int) -> ReactionPublic | None:
        stmt = select(Reaction).where(Reaction.reaction_id == reaction_id)

        async with self.session.begin():
            result = await self.session.execute(stmt)
            res = result.scalar_one_or_none()

            if not res:
                return None

        return ReactionPublic.model_validate(res, from_attributes=True)

    async def add_reaction(
        self,
        message_id: int,
        user_id: int,
        reaction_type: str,
    ) -> ReactionPublic:
        try:
            async with self.session.begin():
                reaction = Reaction(
                    message_id=message_id,
                    user_id=user_id,
                    reaction_type=reaction_type,
                )
                self.session.add(reaction)
                await self.session.flush()
                await self.session.refresh(reaction)

            return ReactionPublic.model_validate(reaction, from_attributes=True)
        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="reaction", orig=ie.orig) from ie

    async def remove_reaction(
        self,
        message_id: int,
        user_id: int,
        reaction_id: int,
    ) -> None:
        stmt = (
            delete(Reaction)
            .where(
                Reaction.message_id == message_id,
                Reaction.user_id == user_id,
                Reaction.reaction_id == reaction_id,
            )
        )

        try:
            async with self.session.begin():
                _ = await self.session.execute(stmt)

        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="reaction", orig=ie.orig) from ie


async def get_reaction_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> ReactionRepository:
    return ReactionRepository(session)
