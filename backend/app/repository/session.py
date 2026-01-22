from typing import Annotated

from app.auth.schemas import SessionRead
from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.models import Session, User
from fastapi import Depends
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


class SessionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_session(self, token: str, user_id: int) -> SessionRead:
        try:
            async with self.session.begin():
                session = Session(refresh_token=token, user_id=user_id)
                self.session.add(session)
        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="session", orig=ie.orig) from ie

        return SessionRead.model_validate(session, from_attributes=True)

    async def delete_session_by_user_id(self, user_id: int) -> bool:
        stmt = delete(Session).where(Session.user_id == user_id)
        async with self.session.begin():
            result = await self.session.execute(stmt)

        return result.rowcount > 0

    async def delete_session_by_user_tag(self, tag: str) -> bool:
        stmt = delete(Session).where(
            Session.user_id
            == select(User.user_id).where(User.tag == tag).scalar_subquery()
        )
        async with self.session.begin():
            result = await self.session.execute(stmt)

        return result.rowcount > 0

    async def get_session_by_user_id(
        self, user_id: int
    ) -> SessionRead | None:
        query = select(Session).where(Session.user_id == user_id)

        session = (await self.session.execute(query)).scalar()
        if session is None:
            return None

        return SessionRead.model_validate(session, from_attributes=True)

    async def get_session_by_user_tag(self, tag: str) -> SessionRead | None:
        query = select(Session).where(
            Session.user_id
            == select(User.user_id).where(User.tag == tag).scalar_subquery()
        )

        session = (await self.session.execute(query)).scalar()
        if session is None:
            return None

        return SessionRead.model_validate(session, from_attributes=True)


async def get_session_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> SessionRepository:
    return SessionRepository(session)
