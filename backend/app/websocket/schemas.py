from enum import Enum

from app.message.schemas import ReactionType
from app.schemas import GeneralSchema


class NotificationType(str, Enum):
    NEW_MESSAGE = "new_message"
    NEW_REACTION = "new_reaction"


class NewMessageNotificationPayload(GeneralSchema):
    event_type: NotificationType = NotificationType.NEW_MESSAGE
    chat_name: str
    sender_tag: str
    text: str


class NewReactionNotificationPayload(GeneralSchema):
    event_type: NotificationType = NotificationType.NEW_REACTION
    chat_name: str
    sender_tag: str
    reaction_type: ReactionType
