from typing import Annotated, List

from app.auth.utils import get_password_hash
from app.exceptions.exceptions import NotFoundError
from app.repository.user import UserRepository, get_user_repo
from app.schemas import OkResponse
from app.user.schemas import (
    UserCreate,
    UserCreateResponse,
    UserPublic,
    UserPublicWithFriends,
    UserRead,
    UsersPublic,
)
from fastapi import APIRouter, Depends
from starlette import status

user_router = APIRouter(prefix="/user")
users_router = APIRouter(prefix="/users")


@user_router.post(
    path="", response_model=OkResponse, status_code=status.HTTP_201_CREATED
)
async def create_user(
    user_data: UserCreate, user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    await user_repo.insert_user(
        first_name=user_data.first_name,
        surname=user_data.surname,
        tag=user_data.tag,
        password_hashed=get_password_hash(user_data.password),
    )

    return OkResponse(ok=True)


@user_router.get(
    path="/{user_id}",
    response_model=UserPublicWithFriends,
    status_code=status.HTTP_200_OK,
)
async def get_user(
    user_id: int, user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    user = await user_repo.get_user_by_id(user_id)
    if not user:
        raise NotFoundError(entity="user", entity_id=user_id)

    return UserPublicWithFriends(**user.model_dump())


@users_router.get(path="", response_model=UsersPublic, status_code=status.HTTP_200_OK)
async def get_users(user_repo: Annotated[UserRepository, Depends(get_user_repo)]):
    users: List[UserRead] = await user_repo.get_users()
    if not users:
        raise ValueError()  # TODO: impl err handling

    users_public = [UserPublic(**u.model_dump()) for u in users]
    return UsersPublic(users=users_public)
