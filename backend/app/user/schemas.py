import re
from typing import List, Optional

from pydantic import Field

from app.schemas import GeneralSchema, IdCreateResponse

# --- User --- #

ALPHA_NUM_LATIN = re.compile("[a-zA-Z0-9]*")


class UserBase(GeneralSchema):
    first_name: str = Field(min_length=1, max_length=40)
    surname: str = Field(min_length=1, max_length=40)
    tag: str = Field(min_length=4, max_length=20, pattern=ALPHA_NUM_LATIN)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserCreateResponse(IdCreateResponse):
    pass


class UserRead(UserBase):
    id: int
    password_hashed: str
    friends: List["UserRead"]


class UserUpdate(GeneralSchema):
    first_name: Optional[str] = None
    surname: Optional[str] = None
    tag: Optional[str] = None


class UserDelete(GeneralSchema):
    id: int


class UserPublic(UserBase):
    id: int


class UserPublicWithFriends(UserPublic):
    friends: List["UserRead"]


# --- Users --- #


class UsersPublic(GeneralSchema):
    users: List[UserPublic]


class UsersPublicWithFriends(GeneralSchema):
    users: List[UserPublicWithFriends]


# --- Friends --- #

# TODO:
