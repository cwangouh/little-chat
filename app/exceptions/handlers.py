from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette import status
from starlette.requests import Request

from app.exceptions.codes import Codes
from app.exceptions.exceptions import AppException
from app.logger import setup_logger

logger = setup_logger(__name__)


def log_exception(
    request: Request,
    status_code: int,
    app_exception: AppException,
    logs: list[str] | None = None,
    warnings: list[str] | None = None,
):
    logger.error(
        f"{request.method} {request.url.path} | "
        f"Warnings: {warnings or []} | "
        f"Logs: {logs or []} | "
        f"Status: {status_code} | "
        f"Code: {app_exception.code} | "
        f"Msg: {app_exception.message} | "
        f"Details: {app_exception.details}"
    )


async def handle_app_exception(request: Request, exc: AppException):
    log_exception(
        request=request,
        status_code=exc.status_code,
        app_exception=exc,
        warnings=exc.warnings,
        logs=exc.logs,
    )
    return JSONResponse(status_code=exc.status_code, content=exc.as_dict())


async def handle_request_validation_error(
    request: Request, exc: RequestValidationError
):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    app_exception = AppException(
        code=Codes.REQUEST_VALIDATION_ERROR,
        message="Validation failed",
        details={"errors": exc.errors()},
    )

    log_exception(
        request=request,
        status_code=status_code,
        app_exception=app_exception,
    )
    return JSONResponse(
        status_code=status_code,
        content=app_exception.as_dict(),
    )


async def handle_validation_error(request: Request, exc: ValidationError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    app_exception = AppException(
        code=Codes.PYDANTIC_VALIDATION_ERROR,
        message="Validation failed",
        details={"errors": exc.errors(include_url=False)},
    )

    log_exception(
        request=request,
        status_code=status_code,
        app_exception=app_exception,
    )
    return JSONResponse(
        status_code=status_code,
        content=app_exception.as_dict(),
    )


async def handle_http_exception(request: Request, exc: HTTPException):
    status_code = exc.status_code
    app_exception = AppException(
        code=Codes.HTTP_ERROR,
        message=exc.detail if isinstance(exc.detail, str) else "HTTP error",
        details={"msg": exc.detail},
    )

    log_exception(
        request=request,
        status_code=status_code,
        app_exception=app_exception,
    )
    return JSONResponse(
        status_code=status_code,
        content=app_exception.as_dict(),
    )


async def handle_sqlalchemy_error(request: Request, exc: SQLAlchemyError):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    app_exception = AppException(
        code=Codes.DB_ERROR,
        message="Database error",
    )

    log_exception(
        request=request,
        status_code=status_code,
        app_exception=app_exception,
    )
    return JSONResponse(
        status_code=status_code,
        content=app_exception.as_dict(),
    )


async def handle_value_error(request: Request, exc: ValueError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    app_exception = AppException(code=Codes.BAD_VALUE, message="Internal Server Error")

    log_exception(
        request=request,
        status_code=status_code,
        app_exception=app_exception,
    )
    return JSONResponse(
        status_code=status_code,
        content=app_exception.as_dict(),
    )


async def handle_global_exception(request: Request, exc: Exception):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    app_exception = AppException(
        code=Codes.UNKNOWN_ERROR,
        message="Unexpected server error",
    )

    log_exception(
        request=request,
        status_code=status_code,
        app_exception=app_exception,
    )
    return JSONResponse(
        status_code=status_code,
        content=app_exception.as_dict(),
    )
