from fastapi import APIRouter

router = APIRouter(prefix="/telemetry-api")

@router.get("/")
async def get_telemetry_api():
    return {"status": "ok"}