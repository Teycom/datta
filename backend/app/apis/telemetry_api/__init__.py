from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
import time

# Assuming logger_utils is in the same parent directory and handles its own DB setup
from app.apis.logger_utils import add_log_entry

router = APIRouter(prefix="/telemetry", tags=["telemetry"])

class TelemetryData(BaseModel):
    log_hash: Optional[str] = Field(None, description="Identifier hash for the event or session.")
    is_false_positive: Optional[bool] = Field(None, description="Flag indicating if a block was a false positive.")
    ml_score: Optional[float] = Field(None, description="Machine learning score associated with the event.")
    js_time: Optional[float] = Field(None, description="JavaScript execution time or similar client-side timing.")
    event: str = Field(..., description="The type of event being logged, e.g., 'page_view', 'bot_detection'.")
    reason: Optional[str] = Field(None, description="Reason for the event, e.g., 'ml_bot_score_high'.")
    score: Optional[float] = Field(None, description="General score if applicable, distinct from ml_score.")
    campaign_id: Optional[int] = Field(None, description="Identifier for an ad campaign.")
    fingerprint_hash: Optional[str] = Field(None, description="Hash of the user's browser fingerprint.")
    additional_data: Optional[Dict[str, Any]] = Field(None, description="Any other relevant data for the log entry.")


@router.post("/record-v2", summary="Record a telemetry event (v2)", response_description="Status of the telemetry recording v2")
async def record_telemetry_v2(telemetry_data: TelemetryData, request: Request):
    """
    Receives telemetry data from the client (e.g., frontend, workers) and logs it.
    This endpoint is crucial for monitoring system behavior, training ML models,
    and identifying potential issues or false positives.
    """
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    try:
        log_id = add_log_entry(
            event=telemetry_data.event,
            log_hash=telemetry_data.log_hash, # Ensure client sends this, derived from IP/UA + other factors
            reason=telemetry_data.reason,
            score=telemetry_data.score,
            # ip_address=client_ip, # Removed: Rely on log_hash/fingerprint_hash for anonymity
            # user_agent=user_agent,  # Removed: Rely on log_hash/fingerprint_hash for anonymity
            campaign_id=telemetry_data.campaign_id,
            fingerprint_hash=telemetry_data.fingerprint_hash, # Client should provide this as primary anonymous ID
            ml_score=telemetry_data.ml_score,
            additional_data={"js_time": telemetry_data.js_time, "is_false_positive": telemetry_data.is_false_positive,**(telemetry_data.additional_data or {})}
        )

        if log_id is not None:
            return {"status": "success", "log_id": log_id, "message": "Telemetry recorded successfully."}
        else:
            # Log entry failed, details should be in server logs from logger_utils
            raise HTTPException(status_code=500, detail="Failed to record telemetry. Logger reported an error.")

    except Exception as e:
        # Catch any other unexpected errors during telemetry processing
        print(f"Error in /record-v2 telemetry endpoint: {e}") # For server-side logging
        raise HTTPException(status_code=500, detail=f"Internal server error while recording telemetry: {str(e)}")

# Example of how you might add more specific telemetry endpoints if needed
# @router.post("/report-false-positive")
# async def report_false_positive(log_hash: str, user_feedback: Optional[str] = None):
#     # ... logic to find original log by hash and mark as false positive ...
#     # add_log_entry(event="false_positive_report", log_hash=log_hash, additional_data={"feedback": user_feedback})
#     return {"status": "success", "message": "False positive report received."}

