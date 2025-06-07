from fastapi import APIRouter

auth_router = APIRouter(prefix="/auth")


@auth_router.post(path="/token")
async def get_token():
    pass


@auth_router.post(path="/token/refresh")
async def get_token():
    pass


@auth_router.post(path="/logout")
async def logout():
    pass
