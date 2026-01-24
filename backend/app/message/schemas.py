from datetime import datetime
from enum import Enum
from typing import List

from app.schemas import GeneralSchema
from pydantic import Field


class MessageCreate(GeneralSchema):
    conversation_id: int = Field(...)
    text: str = Field(
        ...,
        min_length=1,
        max_length=2047,
    )


class MessageEdit(GeneralSchema):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2047,
    )


class ReactionType(str, Enum):
    LIKE = "like"
    LAUGH = "laugh"
    SAD = "sad"
    ANGRY = "angry"
    FIRE = "fire"


class ReactionCreate(GeneralSchema):
    reaction_type: ReactionType = Field(...)


class ReactionPublic(GeneralSchema):
    reaction_type: ReactionType
    user_id: int

    class Config:
        from_attributes = True


class MessagePublic(GeneralSchema):
    message_id: int
    conversation_id: int
    user_id: int

    text: str
    is_edited: bool
    created_at: datetime

    reactions: List[ReactionPublic] = []

    class Config:
        from_attributes = True
