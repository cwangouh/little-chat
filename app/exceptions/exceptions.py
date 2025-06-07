from starlette import status

from app.exceptions.codes import Codes
from app.exceptions.schemas import ErrorContent, ErrorResponse, NotFoundDetails


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict | None = None
    ) -> None:
        self.status_code = status_code

        self.code = code
        self.message = message
        self.details = details or {}

        self.response = ErrorResponse(
            error=ErrorContent(
                code=self.code,
                message=self.message,
                details=self.details
            )
        )

    def as_dict(self) -> dict:
        return self.response.model_dump()


class NotFoundError(AppException):
    def __init__(self, entity: str, entity_id: int):
        details = NotFoundDetails(entity=entity, entity_id=entity_id)
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code=Codes.NOT_FOUND_ERROR,
            message=f"{entity.capitalize()} with id={entity_id} not found",
            details=details.model_dump()
        )
