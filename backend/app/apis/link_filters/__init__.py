from fastapi import APIRouter

router = APIRouter(prefix="/link-filters")

@router.get("/")
async def get_link_filters():
    return {"status": "ok"}