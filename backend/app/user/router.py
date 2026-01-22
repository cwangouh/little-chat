from typing import Annotated

from app.auth.utils import get_password_hash
from app.exceptions.exceptions import NotFoundError
from app.repository.user import UserRepository, get_user_repo
from app.schemas import OkResponse
from app.user.dependencies import get_current_user_by_token
from app.user.schemas import (
    UpdateProfile,
    UserCreate,
    UserPublicWithContacts,
    UserRead,
)
from fastapi import APIRouter, Depends
from starlette import status

user_router = APIRouter(prefix="/user")


@user_router.post(
    path="", response_model=OkResponse, status_code=status.HTTP_201_CREATED
)
async def create_user(
    user_data: UserCreate,
    user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    await user_repo.insert_user(
        first_name=user_data.first_name,
        surname=user_data.surname,
        tag=user_data.tag,
        password_hashed=get_password_hash(user_data.password),
    )

    return OkResponse(ok=True)


@user_router.get(
    path="/me",
    response_model=UserPublicWithContacts,
    status_code=status.HTTP_200_OK,
)
async def get_me(
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)]
):
    return UserPublicWithContacts(**current_user.model_dump())


@user_router.get(
    path="/id/{id}",
    response_model=UserPublicWithContacts,
    status_code=status.HTTP_200_OK,
)
async def get_user_by_id(
    _current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    id: int,
    user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    user = await user_repo.get_user_by_id(user_id=id)
    if not user:
        raise NotFoundError(entity="user", entity_id=id)

    return UserPublicWithContacts(**user.model_dump())


@user_router.get(
    path="/tag/{tag}",
    response_model=UserPublicWithContacts,
    status_code=status.HTTP_200_OK,
)
async def get_user_by_tag(
    _current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    tag: str,
    user_repo: Annotated[UserRepository, Depends(get_user_repo)]
):
    user = await user_repo.get_user_by_tag(tag=tag)
    if not user:
        raise NotFoundError(entity="user", entity_id=None)

    return UserPublicWithContacts(**user.model_dump())


@user_router.post(
    "/contacts/tag/{tag}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def add_contact(
    tag: str,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
):
    user = await user_repo.get_user_by_tag(tag)
    if not user:
        raise NotFoundError(entity="user", entity_id=None)

    await user_repo.add_contact(
        user_id=current_user.user_id,
        contact_id=user.user_id,
    )


@user_router.delete(
    "/contacts/{tag}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_contact(
    tag: str,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
):
    user = await user_repo.get_user_by_tag(tag)
    if not user:
        raise NotFoundError(entity="user", entity_id=None)

    await user_repo.delete_contact(
        user_id=current_user.user_id,
        contact_id=user.user_id,
    )


@user_router.patch(
    "/me",
    response_model=UserPublicWithContacts,
)
async def update_profile(
    payload: UpdateProfile,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
):
    user = await user_repo.update_user(
        user_id=current_user.user_id,
        bio=payload.bio,
    )

    return UserPublicWithContacts(**user.model_dump())
