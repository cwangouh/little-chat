from app.schemas import GeneralSchema


class CreateChatRequest(GeneralSchema):
    tag: str


class ChatPublic(GeneralSchema):
    conversation_id: int
    title: str | None
    user_id: int
    user_id2: int
