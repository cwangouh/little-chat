from typing import Annotated

from app.exceptions.codes import Codes
from app.exceptions.exceptions import AppException, NotFoundError
from app.message.schemas import (
    MessageCreate,
    MessageEdit,
    MessagePublic,
    ReactionCreate,
)
from app.repository.chat import ChatRepository, get_chat_repo
from app.repository.message import MessageRepository, get_message_repo
from app.repository.reaction import ReactionRepository, get_reaction_repo
from app.schemas import OkResponse
from app.user.dependencies import get_current_user_by_token
from app.user.schemas import UserRead
from app.websocket.events import WSEventType
from app.websocket.manager import ws_manager
from fastapi import APIRouter, Depends
from starlette import status

message_router = APIRouter(prefix="/chat/{chat_id}/message")
reaction_router = APIRouter(prefix="/message/{message_id}/reaction")


@message_router.post(
    path="",
    response_model=MessagePublic,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    chat_id: int,
    data: MessageCreate,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    message_repo: Annotated[MessageRepository, Depends(get_message_repo)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
):
    chat = await chat_repo.get_chat_by_id(chat_id)
    if not chat:
        raise NotFoundError(entity="chat", entity_id=chat_id)

    if current_user.user_id != chat.user_id and current_user.user_id != chat.user_id2:
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    message_public = await message_repo.create_message(
        conversation_id=chat_id,
        user_id=current_user.user_id,
        text=data.text,
    )

    for user_id in (chat.user_id, chat.user_id2):
        await ws_manager.send_to_user(
            user_id,
            {
                "type": "message.created",
                "payload": MessagePublic.model_validate(message_public).model_dump(),
            }
        )

    return message_public


@message_router.get(
    path="",
    response_model=list[MessagePublic],
    status_code=status.HTTP_200_OK,
)
async def get_messages(
    chat_id: int,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    message_repo: Annotated[MessageRepository, Depends(get_message_repo)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
):
    chat = await chat_repo.get_chat_by_id(chat_id)
    if not chat:
        raise NotFoundError(entity="chat", entity_id=chat_id)

    if current_user.user_id not in (chat.user_id, chat.user_id2):
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    return await message_repo.get_messages_by_chat_id(
        conversation_id=chat_id,
    )


@message_router.patch(
    path="/{message_id}",
    response_model=MessagePublic,
    status_code=status.HTTP_200_OK,
)
async def edit_message(
    chat_id: int,
    message_id: int,
    data: MessageEdit,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    message_repo: Annotated[MessageRepository, Depends(get_message_repo)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
):
    message = await message_repo.get_message_by_id(message_id)
    if not message:
        raise NotFoundError(entity="message", entity_id=message_id)

    chat = await chat_repo.get_chat_by_id(message.conversation_id)
    if not chat:
        raise NotFoundError(entity="chat", entity_id=message.conversation_id)

    if current_user.user_id not in (chat.user_id, chat.user_id2):
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    if message.user_id != current_user.user_id:
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You can edit only your own messages",
            code=Codes.NO_ACCESS,
        )

    message_public = await message_repo.edit_message(
        message_id=message_id,
        user_id=current_user.user_id,
        new_text=data.text,
    )

    for user_id in (chat.user_id, chat.user_id2):
        await ws_manager.send_to_user(
            user_id,
            {
                "type": WSEventType.MESSAGE_UPDATED,
                "payload": message_public.model_dump(),
            }
        )

    return message_public


@message_router.delete(
    path="/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_message(
    chat_id: int,
    message_id: int,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    message_repo: Annotated[MessageRepository, Depends(get_message_repo)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
):
    message = await message_repo.get_message_by_id(message_id)
    if not message:
        raise NotFoundError(entity="message", entity_id=message_id)

    chat = await chat_repo.get_chat_by_id(message.conversation_id)
    if not chat:
        raise NotFoundError(entity="chat", entity_id=message.conversation_id)

    if current_user.user_id not in (chat.user_id, chat.user_id2):
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    if message.user_id != current_user.user_id:
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You can delete only your own messages",
            code=Codes.NO_ACCESS,
        )

    await message_repo.delete_message(
        message_id=message_id,
        user_id=current_user.user_id,
    )

    for user_id in (chat.user_id, chat.user_id2):
        await ws_manager.send_to_user(
            user_id,
            {
                "type": WSEventType.MESSAGE_DELETED,
                "payload": {"message_id": message_id},
            }
        )


@reaction_router.post(
    path="",
    status_code=status.HTTP_201_CREATED,
    response_model=OkResponse,
)
async def add_reaction(
    message_id: int,
    data: ReactionCreate,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    reaction_repo: Annotated[ReactionRepository, Depends(get_reaction_repo)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
    message_repo: Annotated[MessageRepository, Depends(get_message_repo)],
):
    message = await message_repo.get_message_by_id(message_id)
    if not message:
        raise NotFoundError("message", message_id)

    chat = await chat_repo.get_chat_by_id(message.conversation_id)
    if not chat:
        raise NotFoundError("chat", message.conversation_id)

    if current_user.user_id not in (chat.user_id, chat.user_id2):
        raise AppException(
            status_code=403,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    await reaction_repo.add_reaction(
        message_id=message_id,
        user_id=current_user.user_id,
        reaction_type=data.reaction_type,
    )

    for user_id in (chat.user_id, chat.user_id2):
        await ws_manager.send_to_user(
            user_id,
            {
                "type": WSEventType.REACTION_ADDED,
                "payload": {
                    "message_id": message_id,
                    "user_id": current_user.user_id,
                    "reaction_type": data.reaction_type,
                },
            }
        )

    return OkResponse(ok=True)


@reaction_router.delete(
    path="",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_reaction(
    message_id: int,
    current_user: Annotated[UserRead, Depends(get_current_user_by_token)],
    reaction_repo: Annotated[ReactionRepository, Depends(get_reaction_repo)],
    chat_repo: Annotated[ChatRepository, Depends(get_chat_repo)],
    message_repo: Annotated[MessageRepository, Depends(get_message_repo)],
):
    message = await message_repo.get_message_by_id(message_id)
    if not message:
        raise NotFoundError("message", message_id)

    chat = await chat_repo.get_chat_by_id(message.conversation_id)
    if not chat:
        raise NotFoundError("chat", message.conversation_id)

    if current_user.user_id not in (chat.user_id, chat.user_id2):
        raise AppException(
            status_code=403,
            message="You are not a participant of the chat",
            code=Codes.NO_ACCESS,
        )

    await reaction_repo.remove_reaction(
        message_id=message_id,
        user_id=current_user.user_id,
    )

    for user_id in (chat.user_id, chat.user_id2):
        await ws_manager.send_to_user(
            user_id,
            {
                "type": WSEventType.REACTION_REMOVED,
                "payload": {
                    "message_id": message_id,
                    "user_id": current_user.user_id,
                },
            }
        )
