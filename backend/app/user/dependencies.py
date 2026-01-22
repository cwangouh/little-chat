from typing import Annotated

import jwt
from app.auth.dependencies import get_formatted_token
from app.config import ALGORITHM, SECRET_KEY
from app.exceptions.exceptions import InvalidTokenException
from app.repository.user import UserRepository, get_user_repo
from app.user.schemas import UserRead
from fastapi import Depends


async def get_current_user_by_token(
    token: Annotated[str, Depends(get_formatted_token)],
    user_repo: Annotated[UserRepository, Depends(get_user_repo)]
) -> UserRead:
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        tag: str = payload.get("sub")
        if tag is None:
            raise InvalidTokenException()

    except jwt.InvalidTokenError as e:
        raise InvalidTokenException() from e

    user = await user_repo.get_user_by_tag(tag=tag)
    if not user:
        raise InvalidTokenException()

    return user
