from pydantic import BaseModel

from app.exceptions.codes import Codes


class ErrorResponse(BaseModel):
    error: "ErrorContent"


class ErrorContent(BaseModel):
    code: Codes
    message: str
    details: dict


class NotFoundErrorDetails(BaseModel):
    entity: str
    entity_id: int
    
class IntegrityErrorDetails(BaseModel):
    entity: str
    is_uniqueness: bool
