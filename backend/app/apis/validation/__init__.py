from fastapi import APIRouter

router = APIRouter(prefix="/validation")

@router.get("/")
async def get_validation():
    return {"status": "ok"}