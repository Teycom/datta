from fastapi import APIRouter

router = APIRouter(prefix="/logger")

@router.get("/")
async def get_logger():
    return {"status": "ok"}