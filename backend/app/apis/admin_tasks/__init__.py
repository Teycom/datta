from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
# from app.utils.security import get_current_admin_user # Placeholder for auth
from app.apis.logger_utils import clear_old_logs

router = APIRouter(prefix="/admin", tags=["Admin Tasks"])

class ClearLogsResponse(BaseModel):
    status: str
    message: str
    details: str

# This endpoint should be protected, e.g., by IP whitelist, VPN, or proper admin auth.
# For now, it's open for simplicity but clearly marked for internal use.
@router.post("/tasks/clear-old-logs", 
            response_model=ClearLogsResponse, 
            summary="Trigger manual cleanup of old SQLite log entries",
            include_in_schema=False # Hide from public OpenAPI docs by default
            )
# async def trigger_clear_old_logs(days_to_keep: int = 30, current_user: dict = Depends(get_current_admin_user)):
async def trigger_clear_old_logs(days_to_keep: int = 30):
    """
    Manually triggers the deletion of SQLite log entries older than `days_to_keep`.
    **Security Note:** This is an administrative endpoint and MUST be protected in a production environment.
    """
    if not (isinstance(days_to_keep, int) and 0 < days_to_keep <= 3650): # Cap at 10 years for safety
        raise HTTPException(status_code=400, detail="'days_to_keep' must be an integer between 1 and 3650.")

    print(f"Admin task: Request to clear logs older than {days_to_keep} days.")
    success, message_detail = clear_old_logs(days_to_keep=days_to_keep)

    if success:
        return ClearLogsResponse(
            status="success", 
            message=f"Log cleanup task executed for entries older than {days_to_keep} days.",
            details=message_detail
        )
    else:
        # Avoid raising HTTPException here if clear_old_logs already formulates a good error message
        # If clear_old_logs can raise its own HTTPExceptions for bad input, that's also an option.
        # For now, wrapping its error message.
        return ClearLogsResponse(
            status="error",
            message="Log cleanup task encountered an error.",
            details=message_detail
        )
        # Or, if we want to signal server error more strongly:
        # raise HTTPException(status_code=500, detail=message_detail)
