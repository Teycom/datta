from fastapi import APIRouter

router = APIRouter(prefix="/turnstile-api")

@router.get("/")
async def get_turnstile():
    return {"status": "ok"}