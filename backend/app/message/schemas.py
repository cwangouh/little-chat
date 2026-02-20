from datetime import datetime
from enum import Enum
from typing import List

from app.schemas import GeneralSchema
from pydantic import Field


class MessageCreate(GeneralSchema):
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
    HEART = "heart"
    EMBARRASSED = "embarrassed"


class ReactionCreate(GeneralSchema):
    reaction_type: ReactionType = Field(...)


class ReactionPublic(GeneralSchema):
    reaction_id: int
    reaction_type: ReactionType
    message_id: int
    user_id: int

    class Config:
        from_attributes = True


class MessagePublic(GeneralSchema):
    message_id: int
    text: str
    user_id: int
    created_at: datetime
    is_edited: bool
    conversation_id: int
    reactions: List[ReactionPublic] = []

    class Config:
        from_attributes = True
