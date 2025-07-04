from pydantic import BaseModel


class GeneralSchema(BaseModel):
    pass


class OkResponse(GeneralSchema):
    ok: bool


class IdCreateResponse(GeneralSchema):
    id: int
