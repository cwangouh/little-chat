from fastapi import FastAPI

from app.user.router import user_router
from app.db import start_db, stop_db


async def lifespan(app: FastAPI):
    await start_db()
    yield
    await stop_db()

app = FastAPI(
    title="Little chat",
    description="For studying purposes",
    version="0.0.1",
    root_path="/api/v1",
    lifespan=lifespan
)

app.include_router(user_router)
