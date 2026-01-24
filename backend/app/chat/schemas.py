
from app.schemas import GeneralSchema


class CreateChatRequest(GeneralSchema):
    tag: str


class ChatPublic(GeneralSchema):
    conversation_id: int
    title: str | None
    user_id: int
    user_id2: int


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
