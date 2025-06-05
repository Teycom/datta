from fastapi import APIRouter

router = APIRouter(prefix="/telemetry")

@router.get("/")
async def get_telemetry():
    return {"status": "ok"}