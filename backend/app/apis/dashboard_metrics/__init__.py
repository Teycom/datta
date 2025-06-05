from fastapi import APIRouter

router = APIRouter(prefix="/dashboard-metrics")

@router.get("/")
async def get_dashboard_metrics():
    return {"status": "ok"}