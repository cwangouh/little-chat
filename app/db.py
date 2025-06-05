from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import URL_DB
from app.models import Base
from app.user.models import *

engine = create_async_engine(URL_DB)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def start_db():
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def stop_db():
    await engine.dispose()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
