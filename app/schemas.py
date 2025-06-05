from pydantic import BaseModel


class GeneralSchema(BaseModel):
    pass


class IdCreateResponse(GeneralSchema):
    id: int
