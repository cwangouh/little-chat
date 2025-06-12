from typing import List, Optional

from app.schemas import GeneralSchema, IdCreateResponse

# --- User --- #


class UserBase(GeneralSchema):
    first_name: str
    surname: str
    tag: str


class UserCreate(UserBase):  # TODO: add password here later
    pass


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
