from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field
from typing import Optional
# from app.apis.logger_utils import add_log_entry
import random

router = APIRouter(prefix="/behavior")

class BehaviorInput(BaseModel):
    # These would typically be extracted from request headers or client-side checks
    # For a GET request, we might pass them as query parameters. 
    # If the list grows, a POST with a body might be better, but task specifies GET.
    has_webrtc: Optional[bool] = Query(None, description="Client supports WebRTC")
    has_sensors: Optional[bool] = Query(None, description="Client reports sensor data (e.g., DeviceMotionEvent)")
    accept_language: Optional[str] = Query(None, description="Accept-Language header")
    # Add more parameters as needed, e.g., specific header checks, user agent consistency etc.

class BehaviorResponse(BaseModel):
    risk_score: float # A score between 0.0 (low risk) and 1.0 (high risk)
    analysis_notes: list[str]

@router.get("", response_model=BehaviorResponse)
async def analyse_behavior(
    request: Request, # Added Request to access client IP
    has_webrtc: Optional[bool] = Query(None, description="Client supports WebRTC"),
    has_sensors: Optional[bool] = Query(None, description="Client reports sensor data (e.g., DeviceMotionEvent)"),
    accept_language: Optional[str] = Query(None, description="Accept-Language header from client"),
    user_agent: Optional[str] = Query(None, description="User-Agent header from client"),
    # You can inject Depends(Headers) to get all headers if needed for more complex logic
):
    """
    Analyzes passive behavioral data to provide a mocked risk score.
    In a real system, this would involve more sophisticated rules or a simple model.
    """
    risk_score = 0.0
    notes = []

    # Mocked scoring logic
    if has_webrtc is False:
        risk_score += 0.3
        notes.append("WebRTC not detected, potential indicator of a non-standard browser environment.")
    elif has_webrtc is True:
        notes.append("WebRTC detected.")
    else:
        risk_score += 0.1 # Missing data can be a slight risk factor
        notes.append("WebRTC presence not specified.")

    if has_sensors is False:
        risk_score += 0.2
        notes.append("Device sensors not detected, less common for mobile human users.")
    elif has_sensors is True:
        notes.append("Device sensors detected.")
    else:
        risk_score += 0.1
        notes.append("Sensor presence not specified.")

    if accept_language:
        if "en-US" in accept_language or "pt-BR" in accept_language: # Example preferred languages
            notes.append(f"Accept-Language '{accept_language}' is common.")
        else:
            risk_score += 0.1
            notes.append(f"Accept-Language '{accept_language}' is less common or missing, slight risk increase.")
    else:
        risk_score += 0.2
        notes.append("Accept-Language header missing, potential indicator of automated request.")
    
    # Add some randomness to the mock score for variability
    risk_score += random.uniform(0.0, 0.2)
    
    # Normalize score to be between 0 and 1
    risk_score = min(max(risk_score, 0.0), 1.0)

    print(f"Behavior analysis for params (webrtc: {has_webrtc}, sensors: {has_sensors}, lang: {accept_language}) resulted in score: {risk_score:.2f}")
    
    # Log this behavior analysis event to SQLite
    analysis_result = {"risk_score": round(risk_score, 2), "notes": notes}
    client_identifier = f"{has_webrtc}_{has_sensors}_{accept_language}"  # Simple hash for demo
    ip_address = request.client.host if request.client else None
    try:
        pass
        # add_log_entry(event="behavior_analyzed", log_hash=client_identifier, reason="Passive analysis completed", additional_data=analysis_result, ip_address=ip_address)
    except Exception as e:
        pass
        # add_log_entry(event="behavior_analysis_error", log_hash=client_identifier if 'client_identifier' in locals() else 'unknown_behavior_error', reason=str(e), ip_address=ip_address)

    return BehaviorResponse(risk_score=round(risk_score, 2), analysis_notes=notes)

# Example Usage (conceptual):
# GET /behavior?has_webrtc=true&has_sensors=true&accept_language=en-US,en;q=0.9
# GET /behavior?has_webrtc=false&accept_language=ru
