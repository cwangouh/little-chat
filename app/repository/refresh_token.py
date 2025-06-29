from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import RefreshTokenRead
from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.models import RefreshToken, User


class RefreshTokenRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_refresh_token(self, token: str, user_id: int) -> RefreshTokenRead:
        try:
            async with self.session.begin():
                refresh_token = RefreshToken(token=token, user_id=user_id)
                self.session.add(refresh_token)
        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="refresh_token", orig=ie.orig) from ie

        return RefreshTokenRead.model_validate(refresh_token, from_attributes=True)

    async def delete_refresh_token_by_user_id(self, user_id: int) -> bool:
        stmt = delete(RefreshToken).where(RefreshToken.user_id == user_id)
        async with self.session.begin():
            result = await self.session.execute(stmt)

        return result.rowcount > 0

    async def delete_refresh_token_by_user_tag(self, tag: str) -> bool:
        stmt = delete(RefreshToken).where(
            RefreshToken.user_id
            == select(User.id).where(User.tag == tag).scalar_subquery()
        )
        async with self.session.begin():
            result = await self.session.execute(stmt)

        return result.rowcount > 0

    async def get_refresh_token_by_user_id(
        self, user_id: int
    ) -> RefreshTokenRead | None:
        query = select(RefreshToken).where(RefreshToken.user_id == user_id)

        refresh_token = (await self.session.execute(query)).scalar()
        if refresh_token is None:
            return None

        return RefreshTokenRead.model_validate(refresh_token, from_attributes=True)

    async def get_refresh_token_by_user_tag(self, tag: str) -> RefreshTokenRead | None:
        query = select(RefreshToken).where(
            RefreshToken.user_id
            == select(User.id).where(User.tag == tag).scalar_subquery()
        )

        refresh_token = (await self.session.execute(query)).scalar()
        if refresh_token is None:
            return None

        return RefreshTokenRead.model_validate(refresh_token, from_attributes=True)


async def get_refresh_token_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> RefreshTokenRepository:
    return RefreshTokenRepository(session)
