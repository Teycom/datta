from fastapi import APIRouter

router = APIRouter(prefix="/cloaking-decision")

@router.get("/")
async def get_cloaking_decision():
    return {"status": "ok"}