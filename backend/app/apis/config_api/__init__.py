from fastapi import APIRouter

router = APIRouter(prefix="/config")

@router.get("/")
async def get_config():
    return {"status": "ok"}