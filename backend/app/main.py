from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.auth.router import auth_router
from app.db import start_db, stop_db
from app.exceptions.exceptions import AppException
from app.exceptions.handlers import (
    handle_app_exception,
    handle_global_exception,
    handle_http_exception,
    handle_request_validation_error,
    handle_sqlalchemy_error,
    handle_validation_error,
    handle_value_error,
)
from app.user.router import user_router, users_router


async def lifespan(app: FastAPI):
    await start_db()
    yield
    await stop_db()


app = FastAPI(
    title="Little chat",
    description="For studying purposes",
    version="0.0.1",
    root_path="/api/v1",
    lifespan=lifespan,
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTION", "PUT"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(users_router)


app.exception_handler(AppException)(handle_app_exception)
app.exception_handler(RequestValidationError)(handle_request_validation_error)
app.exception_handler(ValidationError)(handle_validation_error)
app.exception_handler(HTTPException)(handle_http_exception)
app.exception_handler(SQLAlchemyError)(handle_sqlalchemy_error)
app.exception_handler(ValueError)(handle_value_error)
app.exception_handler(Exception)(handle_global_exception)
