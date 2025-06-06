from typing import Annotated
from fastapi import Depends
from fastapi.security import APIKeyCookie

cookie_scheme = APIKeyCookie(name="jwt")

async def get_formatted_token(
        raw_token: Annotated[str, Depends(cookie_scheme)],
) -> str:
    parts = raw_token.split()
    return parts[1].strip()