from fastapi import APIRouter

router = APIRouter(prefix="/behavior")

@router.get("/")
async def get_behavior():
    return {"status": "ok"}