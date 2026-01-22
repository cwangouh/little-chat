from typing import Annotated, List

from app.db import get_async_session
from app.exceptions.exceptions import IntegrityError
from app.models import User
from app.user.schemas import UserCreateResponse, UserRead
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError as SQLAlchemyIntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def insert_user(
        self, first_name: str, surname: str, tag: str, password_hashed: str
    ) -> UserCreateResponse:
        try:
            async with self.session.begin():
                user = User(
                    first_name=first_name,
                    surname=surname,
                    tag=tag,
                    password_hashed=password_hashed,
                )
                self.session.add(user)
        except SQLAlchemyIntegrityError as ie:
            raise IntegrityError(entity="user", orig=ie.orig) from ie

        return UserCreateResponse.model_validate(user, from_attributes=True)

    async def get_user_by_id(self, user_id: int) -> UserRead | None:
        q = select(User).options(selectinload(
            User.contacts)).where(User.user_id == user_id)
        async with self.session.begin():
            coro = await self.session.execute(q)

            user = coro.scalar()
            if user is None:
                return None

        return UserRead.model_validate(user, from_attributes=True)

    async def get_user_by_tag(self, tag: str) -> UserRead | None:
        q = select(User).options(selectinload(
            User.contacts)).where(User.tag == tag)
        async with self.session.begin():
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

    async def add_contact(self, user_id: int, contact_id: int) -> None:
        raise NotImplementedError()

    async def delete_contact(self, user_id: int, contact_id: int) -> None:
        raise NotImplementedError()

    async def update_user(self, user_id: int, bio: str | None) -> UserRead:
        raise NotImplementedError()


async def get_user_repo(
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> UserRepository:
    return UserRepository(session)
