
from app.schemas import GeneralSchema


class CreateChatRequest(GeneralSchema):
    tag: str


class CreateChatResponse(GeneralSchema):
    conversation_id: int


class ChatPreview(GeneralSchema):
    conversation_id: int
    title: str
    # last_message: str | None
    # last_message_at: str | None


class MessagePublic(GeneralSchema):
    message_id: int
    conversation_id: int
    user_id: int
    text: str
    created_at: str
    reactions: list["ReactionPublic"]


class ReactionPublic(GeneralSchema):
    reaction_id: int
    reaction_type: str
