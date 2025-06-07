from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette import status
from starlette.requests import Request

from app.exceptions.codes import Codes
from app.exceptions.exceptions import AppException


async def handle_app_exception(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content=exc.as_dict())


async def handle_request_validation_error(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=AppException(
            code=Codes.REQUEST_VALIDATION_ERROR,
            message="Validation failed",
            details={"errors": exc.errors()},
        ).as_dict(),
    )


async def handle_validation_error(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=AppException(
            code=Codes.PYDANTIC_VALIDATION_ERROR,
            message="Validation failed",
            details={"errors": exc.errors(include_url=False)},
        ).as_dict(),
    )


async def handle_http_exception(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=AppException(
            code=Codes.HTTP_ERROR,
            message=exc.detail if isinstance(exc.detail, str) else "HTTP error",
            details={"msg": exc.detail},
        ).as_dict(),
    )


async def handle_sqlalchemy_error(request: Request, exc: SQLAlchemyError):
    # TODO: logging
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=AppException(
            code=Codes.DB_ERROR,
            message="Database error",
        ).as_dict(),
    )


async def handle_value_error(request: Request, exc: ValueError):
    # TODO: logging
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=AppException(
            code=Codes.BAD_VALUE, message="Internal Server Error"
        ).as_dict(),
    )


async def handle_global_exception(request: Request, exc: Exception):
    # TODO: logging
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=AppException(
            code=Codes.UNKNOWN_ERROR,
            message="Unexpected server error",
        ).as_dict(),
    )
