from enum import Enum


class WSEventType(str, Enum):
    MESSAGE_CREATED = "message.created"
    MESSAGE_UPDATED = "message.updated"
    MESSAGE_DELETED = "message.deleted"

    REACTION_ADDED = "reaction.added"
    REACTION_REMOVED = "reaction.removed"

    CHAT_CREATED = "chat.created"
    CHAT_DELETED = "chat.deleted"

    NOTIFICATION = "notification"
    ERROR = "error"
