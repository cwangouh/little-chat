from typing import Annotated

from app.chat.schemas import ChatPublic, CreateChatRequest, MessagePublic
from app.exceptions.codes import Codes
from app.exceptions.exceptions import AppException, NotFoundError
from app.repository.chat import ChatRepository, get_chat_repo
from app.repository.message import MessageRepository, get_message_repo
from app.repository.user import UserRepository, get_user_repo
from app.schemas import OkResponse
from app.user.dependencies import get_current_user_by_token
from app.user.schemas import (
    UserRead,
)
from fastapi import APIRouter, Depends
from starlette import status

chat_router = APIRouter(prefix="/chat")


@chat_router.post(
    "",
    response_model=OkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_chat(
    payload: CreateChatRequest,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
):
    other = await user_repo.get_user_by_tag(payload.tag)
    if not other:
        raise NotFoundError(entity="user", entity_id=None)

    if current_user.user_id == other.user_id:
        raise AppException(
            code=Codes.CANNOT_CREATE_CHAT_WITH_YOURSELF,
            message="Cannot create chat with yourself",
        )

    res = await chat_repo.insert_chat(
        title=f"{current_user.tag}-{other.tag}",
        user_id=current_user.user_id,
        user_id2=other.user_id,
    )
    if res is None:
        raise AppException(
            code=Codes.CHAT_ALREADY_EXISTS,
            message="Chat between these users already exists",
        )

    return OkResponse(ok=True)


@chat_router.get("", response_model=list[ChatPublic])
async def get_my_chats(
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
):
    return await chat_repo.get_chats_by_user_id(current_user.user_id)


@chat_router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_chat(
    conversation_id: int,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
):
    chat = await chat_repo.get_chat_by_id(conversation_id)
    if not chat:
        raise NotFoundError(entity="chat", entity_id=conversation_id)

    if current_user.user_id != chat.user_id and current_user.user_id != chat.user_id2:
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    await chat_repo.delete_chat_by_id(conversation_id)
    return OkResponse(ok=True)
