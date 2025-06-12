from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import RefreshToken as RefreshTokenSchema
from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.models import RefreshToken as RefreshTokenModel


class RefreshTokenRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_refresh_token(
        self, token: str, user_id: int
    ) -> RefreshTokenSchema:
        try:
            async with self.session.begin():
                refresh_token = RefreshTokenModel(token=token, user_id=user_id)
                self.session.add(refresh_token)
        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="refresh_token", orig=ie.orig) from ie

        return RefreshTokenSchema.model_validate(refresh_token, from_attributes=True)

    async def delete_refresh_token_by_username(self, user_id: int) -> bool:
        async with self.session.begin():
            stmt = delete(RefreshTokenModel).where(RefreshTokenModel.user_id == user_id)
            result = await self.session.execute(stmt)

        return result.rowcount > 0

    async def get_refresh_token_by_user_id(
        self, user_id: int
    ) -> RefreshTokenSchema | None:
        query = select(RefreshTokenModel).where(RefreshTokenModel.user_id == user_id)

        refresh_token = (await self.session.execute(query)).scalar()
        if refresh_token is None:
            return None

        return RefreshTokenSchema.model_validate(refresh_token, from_attributes=True)


async def get_refresh_token_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> RefreshTokenRepository:
    return RefreshTokenRepository(session)
