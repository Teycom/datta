from fastapi import APIRouter

router = APIRouter(prefix="/admin-tasks")

@router.get("/")
async def get_admin_tasks():
    return {"status": "ok"}