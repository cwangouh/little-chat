from typing import Annotated

from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.models import Reaction
from fastapi import Depends
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


class ReactionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add_reaction(
        self,
        message_id: int,
        user_id: int,
        reaction_type: str,
    ) -> None:
        try:
            async with self.session.begin():
                reaction = Reaction(
                    message_id=message_id,
                    user_id=user_id,
                    reaction_type=reaction_type,
                )
                self.session.add(reaction)

        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="reaction", orig=ie.orig) from ie

    async def remove_reaction(
        self,
        message_id: int,
        user_id: int,
    ) -> None:
        stmt = (
            delete(Reaction)
            .where(
                Reaction.message_id == message_id,
                Reaction.user_id == user_id,
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
