from fastapi import APIRouter

router = APIRouter(prefix="/cloaking-orchestration")

@router.get("/")
async def get_cloaking_orchestration():
    return {"status": "ok"}