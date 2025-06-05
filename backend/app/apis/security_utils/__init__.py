from fastapi import APIRouter

router = APIRouter(prefix="/security")

@router.get("/")
async def get_security():
    return {"status": "ok"}