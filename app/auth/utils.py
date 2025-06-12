from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, PASSWORD_SALT, SECRET_KEY
from app.repository.user import UserRepository
from app.user.schemas import UserRead

crypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    salted = plain_password + PASSWORD_SALT
    return crypt_context.verify(salted, hashed_password)


def get_password_hash(password: str) -> str:
    salted = password + PASSWORD_SALT
    return crypt_context.hash(salted)


async def authenticate_user(
    tag: str, password: str, user_repo: UserRepository
) -> UserRead | None:
    user = await user_repo.get_user_by_tag(tag)
    if not user:
        return None

    if not verify_password(password, user.password_hashed):
        return None

    return user


def create_jwt_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
