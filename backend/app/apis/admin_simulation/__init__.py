from fastapi import APIRouter

router = APIRouter(prefix="/admin-simulation")

@router.get("/")
async def get_admin_simulation():
    return {"status": "ok"}