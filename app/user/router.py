from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from starlette import status

from app.repository.user import UserRepository, get_user_repo
from app.user.schemas import UserCreate, UserCreateResponse, UserPublic, UserPublicWithFriends, UserRead


user_router = APIRouter(prefix="/user")


@user_router.post(
    path="",
    response_model=UserCreateResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    user_data: UserCreate,
    user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    return await user_repo.insert_user(**user_data.model_dump())


@user_router.get(
    path="/{user_id}",
    response_model=UserPublicWithFriends,
    status_code=status.HTTP_200_OK
)
async def get_user(
    user_id: int,
    user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    user = await user_repo.get_user_by_id(user_id)
    if not user:
        raise ValueError() # TODO: impl err handling

    return UserPublicWithFriends(**user.model_dump())
