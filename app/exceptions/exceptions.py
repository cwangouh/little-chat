from typing import Any

from asyncpg.exceptions import IntegrityConstraintViolationError, UniqueViolationError
from starlette import status

from app.exceptions.codes import Codes
from app.exceptions.schemas import (
    ErrorContent,
    ErrorResponse,
    IntegrityErrorDetails,
    NotFoundErrorDetails,
)


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict | None = None,
    ) -> None:
        self.warnings: list[str] = []
        self.status_code = status_code

        self.code = code
        self.message = message
        self.details = details or {}

        self.response = ErrorResponse(
            error=ErrorContent(
                code=self.code, message=self.message, details=self.details
            )
        )

    def as_dict(self) -> dict:
        return self.response.model_dump()


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
    def __init__(self, entity: str, orig: Any):
        is_uniqueness = False
        if isinstance(orig, IntegrityConstraintViolationError):
            if isinstance(orig, UniqueViolationError):
                is_uniqueness = True
        else:
            self.warnings.append(
                f"Cannot derive type of constraint in IntegrityError due to unknown DB driver. Orig class: {type(orig).__name__}"
            )

        details = IntegrityErrorDetails(entity=entity, is_uniqueness=is_uniqueness)
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code=Codes.INTEGRITY_ERROR,
            message=f"Problem while processing {entity}",
            details=details.model_dump(),
        )
