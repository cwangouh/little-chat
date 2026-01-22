import re
from typing import List

from app.schemas import GeneralSchema
from pydantic import Field

# --- User --- #

ALPHA_NUM_LATIN = re.compile("[a-zA-Z0-9]*")


class UserBase(GeneralSchema):
    first_name: str = Field(min_length=1, max_length=40)
    surname: str = Field(min_length=1, max_length=40)
    tag: str = Field(min_length=4, max_length=20, pattern=ALPHA_NUM_LATIN)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserCreateResponse(GeneralSchema):
    user_id: int


class UserRead(UserBase):
    user_id: int
    password_hashed: str
    contacts: List["UserRead"]


class UserPublic(UserBase):
    user_id: int


class UserPublicWithContacts(UserPublic):
    contacts: List["UserPublic"]


# --- Users --- #


class UsersPublic(GeneralSchema):
    users: List[UserPublic]


class UsersPublicWithContacts(GeneralSchema):
    users: List[UserPublicWithContacts]


class UpdateProfile(GeneralSchema):
    bio: str | None = None
