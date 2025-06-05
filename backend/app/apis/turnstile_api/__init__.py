from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
import requests
import databutton as db
from typing import List, Optional

router = APIRouter(prefix="/turnstile", tags=["Turnstile"])

# --- Pydantic Models ---

class TurnstileValidationRequest(BaseModel):
    token: str = Field(..., description="The token received from the Cloudflare Turnstile widget on the frontend.")

class TurnstileValidationResponse(BaseModel):
    success: bool = Field(..., description="Whether the token was successfully validated.")
    challenge_ts: Optional[str] = Field(default=None, description="Timestamp of the challenge load (ISO_8601 format).")
    hostname: Optional[str] = Field(default=None, description="The hostname for which the challenge was served.")
    error_codes: Optional[List[str]] = Field(default_factory=list, description="A list of error codes if validation failed.")
    action: Optional[str] = Field(default=None, description="The customer widget identifier passed to the widget on the client side. This is used to distinguish between different Turnstile widgets on the same site. (Not used by default)")
    cdata: Optional[str] = Field(default=None, description="The customer data passed to the widget on the client side. (Not used by default)")

# --- Cloudflare Siteverify Endpoint ---
CLOUDFLARE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

@router.post("/validate", response_model=TurnstileValidationResponse, status_code=status.HTTP_200_OK)
async def validate_turnstile_token(
    request_payload: TurnstileValidationRequest,
    fastapi_request: Request
):
    """
    Validates a Cloudflare Turnstile token.
    Receives a token from the frontend, sends it to Cloudflare's siteverify endpoint,
    and returns the validation result.
    """
    turnstile_secret_key = db.secrets.get("CLOUDFLARE_TURNSTILE_SECRET_KEY")
    if not turnstile_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Turnstile secret key is not configured on the server."
        )

    # Get client IP from the request
    client_ip = fastapi_request.client.host if fastapi_request.client else None

    payload = {
        "secret": turnstile_secret_key,
        "response": request_payload.token
    }
    if client_ip:
        payload["remoteip"] = client_ip

    try:
        response = requests.post(CLOUDFLARE_SITEVERIFY_URL, data=payload, timeout=10)
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        
        cf_response_data = response.json()
        
        # Log Cloudflare's direct response for debugging if needed
        # print(f"Cloudflare siteverify response: {cf_response_data}")

        return TurnstileValidationResponse(
            success=cf_response_data.get("success", False),
            challenge_ts=cf_response_data.get("challenge_ts"),
            hostname=cf_response_data.get("hostname"),
            error_codes=cf_response_data.get("error-codes", []),
            action=cf_response_data.get("action"),
            cdata=cf_response_data.get("cdata")
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request to Cloudflare timed out."
        )
    except requests.exceptions.RequestException as e:
        # Log the error for server-side debugging
        print(f"Error calling Cloudflare siteverify: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to communicate with Cloudflare verification service. Error: {str(e)}"
        )
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error during Turnstile validation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred. Error: {str(e)}"
        )

# To make this API discoverable by the main app, you might need to ensure
# it's imported in src/main.py or a similar central place if not automatically done by your framework.
# For Databutton, the framework typically handles router discovery from app.apis.
