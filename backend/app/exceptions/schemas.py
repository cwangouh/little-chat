from app.exceptions.codes import Codes
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: "ErrorContent"


class ErrorContent(BaseModel):
    code: Codes
    message: str
    details: dict


class NotFoundErrorDetails(BaseModel):
    entity: str
    entity_id: int | None


class IntegrityErrorDetails(BaseModel):
    entity: str
    is_uniqueness: bool
