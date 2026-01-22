from datetime import timedelta
from typing import Annotated

import jwt
from app.auth.dependencies import get_formatted_token
from app.auth.utils import authenticate_user, create_jwt_token
from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
)
from app.exceptions.codes import Codes
from app.exceptions.exceptions import AppException, InvalidTokenException
from app.repository.refresh_token import RefreshTokenRepository, get_refresh_token_repo
from app.repository.user import UserRepository, get_user_repo
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from jwt import InvalidTokenError
from starlette import status
from starlette.responses import JSONResponse, Response

auth_router = APIRouter(prefix="/auth")


@auth_router.post(path="/token", status_code=status.HTTP_201_CREATED)
async def generate_access_and_refresh_tokens(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
    refresh_token_repo: Annotated[
        RefreshTokenRepository, Depends(get_refresh_token_repo)
    ],
):
    user = await authenticate_user(
        tag=form_data.username, password=form_data.password, user_repo=user_repo
    )
    if not user:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=Codes.INCORRECT_CREDENTIALS,
            message="Incorrect tag or password",
        )

    await refresh_token_repo.delete_refresh_token_by_user_tag(tag=user.tag)

    refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_jwt_token(
        data={"sub": user.tag}, expires_delta=refresh_token_expires
    )
    await refresh_token_repo.insert_refresh_token(token=refresh_token, user_id=user.id)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_jwt_token(
        data={"sub": user.tag}, expires_delta=access_token_expires
    )

    response = Response()
    response.set_cookie(
        key="jwt", value=f"Bearer {access_token}", httponly=True)
    return response


@auth_router.post("/token/refresh", status_code=status.HTTP_201_CREATED)
async def get_refresh_token(
    token: Annotated[str, Depends(get_formatted_token)],
    refresh_token_repo: Annotated[
        RefreshTokenRepository, Depends(get_refresh_token_repo)
    ],
):
    invalid_token = InvalidTokenException()
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[
                ALGORITHM], options={"verify_exp": False}
        )
        tag: str = payload.get("sub")
        if tag is None:
            raise invalid_token

    except InvalidTokenError as e:
        raise invalid_token from e

    refresh_token = await refresh_token_repo.get_refresh_token_by_user_tag(tag=tag)
    if not refresh_token:
        raise invalid_token

    try:
        _ = jwt.decode(
            refresh_token.token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_jwt_token(
            data={"sub": tag}, expires_delta=access_token_expires
        )

        response = Response()
        response.set_cookie(
            key="jwt", value=f"Bearer {access_token}", httponly=True)
        return response
    except InvalidTokenError as e:
        await refresh_token_repo.delete_refresh_token_by_user_tag(tag=tag)
        raise invalid_token from e


@auth_router.post("/logout", status_code=status.HTTP_200_OK)
async def log_out_from_system(
    token: Annotated[str, Depends(get_formatted_token)],
    refresh_token_repo: Annotated[
        RefreshTokenRepository, Depends(get_refresh_token_repo)
    ],
):
    invalid_token = InvalidTokenException()
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[
                ALGORITHM], options={"verify_exp": False}
        )
        tag: str = payload.get("sub")
        if tag is None:
            raise invalid_token

    except InvalidTokenError as e:
        raise invalid_token from e

    result = await refresh_token_repo.delete_refresh_token_by_user_tag(tag=tag)

    response = JSONResponse(content={"result": result})
    response.delete_cookie(key="jwt", httponly=True)
    return response
