from fastapi import APIRouter

router = APIRouter(prefix="/links")

@router.get("/")
async def get_links():
    return {"status": "ok"}