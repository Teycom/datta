from fastapi import APIRouter

router = APIRouter(prefix="/domain-management")

@router.get("/")
async def get_domain_management():
    return {"status": "ok"}