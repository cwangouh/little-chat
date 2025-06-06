from fastapi import APIRouter

auth_router = APIRouter(prefix="/auth")


@auth_router.get(path="/token")
async def get_token():
    pass


@auth_router.get(path="/token/refresh")
async def get_token():
    pass
