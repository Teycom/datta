from fastapi import APIRouter

router = APIRouter(prefix="/fingerprint")

@router.get("/")
async def get_fingerprint():
    return {"status": "ok"}