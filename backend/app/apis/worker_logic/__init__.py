from fastapi import APIRouter

router = APIRouter(prefix="/worker-logic")

@router.get("/")
async def get_worker_logic():
    return {"status": "ok"}