from typing import Any

from starlette import status

from app.exceptions.codes import Codes
from app.exceptions.schemas import (
    ErrorContent,
    ErrorResponse,
    IntegrityErrorDetails,
    NotFoundErrorDetails,
)


class AppException(Exception):
    warnings: list[str] = []
    logs: list[str] = []

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict | None = None,
        headers: dict | None = None,
    ) -> None:
        self.status_code = status_code

        self.code = code  # TODO: check if details correspond to code
        self.message = message
        self.details = details or {}
        self.headers = headers

        self.response = ErrorResponse(
            error=ErrorContent(
                code=self.code, message=self.message, details=self.details
            )
        )

    def as_dict(self) -> dict:
        return self.response.model_dump()


class InvalidTokenException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code=Codes.INVALID_TOKEN,
            message="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


class NotFoundError(AppException):
    def __init__(self, entity: str, entity_id: int):
        details = NotFoundErrorDetails(entity=entity, entity_id=entity_id)
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code=Codes.NOT_FOUND_ERROR,
            message=f"{entity.capitalize()} with id={entity_id} not found",
            details=details.model_dump(),
        )


class IntegrityError(AppException):
    SQLSTATE_RESTRICT = "23001"
    SQLSTATE_NOT_NULL = "23502"
    SQLSTATE_FOREIGN_KEY = "23503"
    SQLSTATE_UNIQUE = "23505"
    SQLSTATE_CHECK = "23514"

    def __init__(self, entity: str, orig: Any):
        is_uniqueness = False
        if hasattr(orig, "sqlstate"):
            self.logs.append(f"Constraint violated: sqlstate={orig.sqlstate}")
            if orig.sqlstate == self.SQLSTATE_UNIQUE:
                is_uniqueness = True
        else:
            self.warnings.append(
                f"Cannot derive the constraint violated: unexpected error type {type(orig).__name__}"
            )

        details = IntegrityErrorDetails(entity=entity, is_uniqueness=is_uniqueness)
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code=Codes.INTEGRITY_ERROR,
            message=f"Problem while processing {entity}",
            details=details.model_dump(),
        )
