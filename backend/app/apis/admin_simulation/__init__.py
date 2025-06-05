from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
import databutton as db # To potentially access stored filter configurations
import random # For mock logic

# Potentially import filter settings model if shared or defined elsewhere
# from app.apis.link_filters import LinkFilterSettings # Assuming it's made accessible

router = APIRouter(prefix="/admin", tags=["Admin Simulation"])

# --- Pydantic Models for Simulation --- #

class SimulationParams(BaseModel):
    user_agent: str = Field(..., example="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1")
    ip_address: str = Field(..., example="8.8.8.8")
    country_code: str = Field(..., example="US")
    device_type: str = Field(..., example="Mobile") # Mobile, Desktop, Tablet, Bot
    link_id: str = Field("campaign_default_filters", example="campaign_default_filters") # To know which filter set to use

class SimulationFilterBreakdown(BaseModel):
    geolocalization: str | None = None
    fingerprinting: str | None = None
    ml_model: str | None = None
    ip_ranges: str | None = None
    # Add other relevant filter checks as they are developed

class SimulationResult(BaseModel):
    decision: str = Field(..., example="Show Black Page / Show White Page / Block")
    reason: str = Field(..., example="Passed all checks. Low ML score.")
    ml_score: float | None = Field(None, example=0.1)
    applied_filters_summary: SimulationFilterBreakdown
    # raw_input_params: SimulationParams # Optionally return what was received for debugging

# --- Helper to get Link Filter Settings (Simplified for now) --- #
# In a real app, this would fetch from db.storage.json like in link_filters api
# For now, we'll use a mock or assume a default if not found.
async def get_link_filter_settings_for_simulation(link_id: str) -> dict:
    try:
        # This key should match how it's stored by the link_filters API
        settings = await db.storage.json.get(f"link_filter_settings_{link_id}")
        print(f"[Simulation] Loaded filter settings for {link_id}: {settings}")
        return settings
    except FileNotFoundError:
        print(f"[Simulation] No filter settings found for {link_id}. Using permissive defaults.")
        # Return a default permissive structure if no specific settings are found
        return {
            "geolocalization": {"enabled": True},
            "fingerprinting": {"enabled": True},
            "ml": {"enabled": True},
            "ipRanges": {"enabled": True, "allowed": "", "blocked": ""},
            "sensitivity": {"jsExecutionTimeMin": 100, "jsExecutionTimeMax": 5000},
            "exceptions": {"ips": "", "isps": "", "devices": ""}
        }
    except Exception as e:
        print(f"[Simulation] Error loading filter settings for {link_id}: {e}. Using permissive defaults.")
        return {
            "geolocalization": {"enabled": True},
            "fingerprinting": {"enabled": True},
            "ml": {"enabled": True},
            "ipRanges": {"enabled": True, "allowed": "", "blocked": ""},
            "sensitivity": {"jsExecutionTimeMin": 100, "jsExecutionTimeMax": 5000},
            "exceptions": {"ips": "", "isps": "", "devices": ""}
        }


@router.post("/simulate_request", response_model=SimulationResult)
async def simulate_cloaking_request(params: SimulationParams = Body(...)):
    print(f"[Simulation] Received simulation request for link_id {params.link_id} with params: {params.model_dump_json(indent=2)}")

    filter_settings = await get_link_filter_settings_for_simulation(params.link_id)
    applied_filters_summary = SimulationFilterBreakdown()
    
    is_bot_heuristic = False
    reasons = []

    # 1. Device Type Check (Simple Heuristic)
    if params.device_type.lower() == "bot":
        is_bot_heuristic = True
        reasons.append("Device type explicitly 'Bot'")
        applied_filters_summary.fingerprinting = "Failed (Device type: Bot)"
    else:
        applied_filters_summary.fingerprinting = f"Passed (Device type: {params.device_type})"

    # 2. IP Address Check (Mocking an IP blocklist from filter_settings)
    # In a real scenario, ipRanges.blocked would be parsed and checked.
    # This is a very simplified check.
    blocked_ips = filter_settings.get("ipRanges", {}).get("blocked", "").split(",")
    blocked_ips = [ip.strip() for ip in blocked_ips if ip.strip()]
    if params.ip_address in blocked_ips:
        is_bot_heuristic = True
        reasons.append(f"IP {params.ip_address} is in blocklist.")
        applied_filters_summary.ip_ranges = f"Failed (IP {params.ip_address} blocked)"
    else:
        applied_filters_summary.ip_ranges = f"Passed (IP {params.ip_address} not in manual blocklist)"

    # 3. Country Code Check (Mocking a geo-block from filter_settings)
    # For simplicity, let's say settings can have a "blocked_countries": ["KP", "IR"]
    # This is not in the current LinkFilterSettings model, so this is a conceptual example.
    # We'll use the geolocalization.enabled flag.
    if filter_settings.get("geolocalization", {}).get("enabled", True):
        # Mock: Block if country is 'KP' (North Korea) for demonstration
        if params.country_code.upper() == "KP":
            is_bot_heuristic = True
            reasons.append("Country KP is blocked by geo-filter.")
            applied_filters_summary.geolocalization = "Failed (Country KP blocked)"
        else:
            applied_filters_summary.geolocalization = f"Passed (Country {params.country_code} allowed)"
    else:
        applied_filters_summary.geolocalization = "Disabled"


    # 4. Mock ML Score
    # A real ML model would take features from params (UA, IP characteristics, etc.)
    mock_ml_score = random.uniform(0.01, 0.99)
    ml_threshold = 0.5 # Example threshold
    if filter_settings.get("ml", {}).get("enabled", True):
        if mock_ml_score >= ml_threshold:
            is_bot_heuristic = True
            reasons.append(f"ML score {mock_ml_score:.2f} >= threshold {ml_threshold}")
            applied_filters_summary.ml_model = f"Failed (Score: {mock_ml_score:.2f} >= {ml_threshold})"
        else:
            applied_filters_summary.ml_model = f"Passed (Score: {mock_ml_score:.2f} < {ml_threshold})"
    else:
        applied_filters_summary.ml_model = "Disabled"
        mock_ml_score = None # No score if ML is disabled

    # Decision Logic
    if is_bot_heuristic:
        decision = "Show White Page / Block"
        if not reasons:
            reasons.append("General bot-like characteristics detected based on active filters.")
    else:
        decision = "Show Black Page"
        reasons.append("Passed all active heuristic checks.")

    final_reason = "; ".join(reasons)

    print(f"[Simulation] Decision for {params.link_id}: {decision}, Reason: {final_reason}, ML Score: {mock_ml_score}")

    return SimulationResult(
        decision=decision,
        reason=final_reason,
        ml_score=mock_ml_score if mock_ml_score is not None else -1.0, # Send -1 if None for Pydantic compatibility if not optional
        applied_filters_summary=applied_filters_summary
    )

# Example of how to run this using an HTTP client (e.g., requests in Python or fetch in JS)
# POST to /admin/simulate_request with JSON body:
# {
#   "user_agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
#   "ip_address": "103.22.200.100",
#   "country_code": "ID",
#   "device_type": "Mobile",
#   "link_id": "my_specific_campaign_filters"
# }

# To make LinkFilterSettings accessible if it were in another API file:
# 1. Ensure `LinkFilterSettings` is defined in `src/app/apis/link_filters/__init__.py`
# 2. You could import it here: `from app.apis.link_filters import LinkFilterSettings`
#    This requires `src/app/apis/link_filters/__init__.py` to be a valid module.
#    Databutton structures usually support `from app.apis.api_name import Model`

# For now, get_link_filter_settings_for_simulation uses db.storage.json.get and a default structure,
# assuming the structure saved by the link_filters API is compatible.
