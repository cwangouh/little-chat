from app.auth.utils import decode_access_token
from app.repository.user import UserRepository
from app.user.schemas import UserRead
from sqlalchemy.ext.asyncio import AsyncSession


async def get_current_user_ws(token: str, session: AsyncSession) -> UserRead | None:
    payload = decode_access_token(token)
    tag = payload.get("sub")
    if not tag:
        return None

    repo = UserRepository(session)
    return await repo.get_user_by_tag(tag)
