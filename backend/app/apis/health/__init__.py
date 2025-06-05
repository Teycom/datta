from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str

@router.get("/health", response_model=HealthResponse, operation_id="health_check_status")
def check_health():
    """Endpoint to check the health of the service."""
    return HealthResponse(status="ok")
