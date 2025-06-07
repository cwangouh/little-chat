from typing import Annotated, List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.models import User
from app.user.schemas import UserCreateResponse, UserRead


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_user(
        self,
        first_name: str,
        surname: str,
        tag: str,
    ) -> UserCreateResponse:
        user = User(first_name=first_name, surname=surname, tag=tag)
        self.session.add(user)

        try:
            await self.session.flush()
            await self.session.commit()
        except SQLAlchemyIntegrityError as ie:
            await self.session.rollback()
            raise IntegrityError(entity="user", orig=ie.orig) from ie

        return UserCreateResponse.model_validate(user, from_attributes=True)

    async def get_user_by_id(self, user_id: int) -> UserRead | None:
        q = select(User).options(selectinload(User.friends)).where(User.id == user_id)
        coro = await self.session.execute(q)
        user = coro.scalar()
        if user is None:
            return None

        return UserRead.model_validate(user, from_attributes=True)

    async def get_users(self) -> List[UserRead] | None:
        q = select(User)
        coro = await self.session.execute(q)
        users = coro.scalars().all()
        return [UserRead.model_validate(u, from_attributes=True) for u in users]


async def get_user_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> UserRepository:
    return UserRepository(session)
