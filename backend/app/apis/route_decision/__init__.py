from fastapi import APIRouter

router = APIRouter(prefix="/route-decision")

@router.get("/")
async def get_route_decision():
    return {"status": "ok"}