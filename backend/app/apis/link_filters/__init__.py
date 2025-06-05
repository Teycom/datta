from fastapi import APIRouter, HTTPException, Body, Depends # Added Depends
from pydantic import BaseModel, Field
from typing import Literal # Added Literal
import databutton as db 
import json

# JWT and User model from security_utils
from app.apis.security_utils import get_current_user, User

router = APIRouter()

# --- Pydantic Models for Filter Configuration ---
class GeolocationFilter(BaseModel):
    enabled: bool = True

class FingerprintingFilter(BaseModel):
    enabled: bool = True

class MLFilter(BaseModel):
    enabled: bool = True

class IPRangesFilter(BaseModel):
    enabled: bool = True
    allowed: str = Field("", description="Comma-separated IP addresses or CIDR ranges that are explicitly allowed, bypassing other checks if matched.")
    blocked: str = Field("", description="Comma-separated IP addresses or CIDR ranges that are always blocked.")

class SensitivityFilter(BaseModel):
    jsExecutionTimeMin: int = Field(default=500, ge=0, description="Minimum JS execution time (ms) for human-like behavior.")
    jsExecutionTimeMax: int = Field(default=2000, ge=0, description="Maximum JS execution time (ms) for human-like behavior.")

class ExceptionsFilter(BaseModel):
    ips: str = Field("", description="Comma-separated IP addresses to exclude from certain checks or to always treat as human/bot.")
    isps: str = Field("", description="Comma-separated ISP names to exclude.")
    devices: str = Field("", description="Comma-separated device types or signatures to exclude.")

# New Filter Models
class DeviceTypeFilter(BaseModel):
    enabled: bool = Field(default=True)
    targetDevice: Literal['all', 'mobile', 'desktop'] = Field(default='all', description="Target device type for the black page.")

class CountryFilter(BaseModel):
    enabled: bool = Field(default=True)
    mode: Literal['allow', 'block'] = Field(default='allow', description="'allow' to only show to listed countries, 'block' to hide from listed countries.")
    countries: list[str] = Field(default_factory=list, description="List of ISO 3166-1 alpha-2 country codes.")

class LanguageFilter(BaseModel):
    enabled: bool = Field(default=True)
    mode: Literal['allow', 'block'] = Field(default='allow', description="'allow' to only show to listed languages, 'block' to hide from listed languages.")
    languages: list[str] = Field(default_factory=list, description="List of ISO 639-1 language codes.")

class LinkFilterSettings(BaseModel):
    geolocalization: GeolocationFilter = Field(default_factory=GeolocationFilter)
    fingerprinting: FingerprintingFilter = Field(default_factory=FingerprintingFilter)
    ml: MLFilter = Field(default_factory=MLFilter)
    ipRanges: IPRangesFilter = Field(default_factory=IPRangesFilter)
    sensitivity: SensitivityFilter = Field(default_factory=SensitivityFilter)
    exceptions: ExceptionsFilter = Field(default_factory=ExceptionsFilter)
    deviceType: DeviceTypeFilter = Field(default_factory=DeviceTypeFilter)
    country: CountryFilter = Field(default_factory=CountryFilter)
    language: LanguageFilter = Field(default_factory=LanguageFilter)

class UpdateLinkFiltersRequest(BaseModel):
    filters: LinkFilterSettings

class FilterUpdateResponse(BaseModel): # Changed from UpdateLinkFiltersResponse
    link_id: str
    message: str
    # current_filters: LinkFilterSettings # Optionally return the updated state

# --- Storage Key Functions ---
def get_link_filters_storage_key(link_id: str) -> str:
    # IMPORTANT: Sanitize link_id if it comes from user input directly.
    # Assuming link_id is safe for now (e.g., integer or pre-validated string).
    # A more robust sanitization might involve re.sub(r'[^a-zA-Z0-9_-]', '', link_id)
    return f"link_filters_config_{link_id}"

# --- API Endpoints ---
# Note: The prompt mentioned /links/{link_id}/filters. The existing code has this path.
# If the operation IDs need to be unique across all APIs, ensure they are.
@router.put("/links/{link_id}/filters", response_model=FilterUpdateResponse, tags=["Cloaking Filters"], operation_id="update_link_filter_settings_for_link")
async def update_link_filter_settings_endpoint( # Renamed for clarity from update_link_filter_settings
    link_id: str, 
    payload: UpdateLinkFiltersRequest = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the filter configuration for a specific cloaked link. Protected by JWT.
    Filter settings are stored in db.storage.json.
    """
    print(f"User '{current_user.username}' updating filter settings for link_id: {link_id}")
    # print(f"Payload: {payload.model_dump_json(indent=2)}") # For verbose logging if needed

    filters_storage_key = get_link_filters_storage_key(link_id)
    
    try:
        # Pydantic handles validation of payload.filters
        db.storage.json.put(filters_storage_key, payload.filters.model_dump()) # Store as dict
        print(f"Successfully saved filter settings for {link_id} to {filters_storage_key}")
    except Exception as e:
        print(f"Error saving filter settings for {link_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save filter settings: {str(e)}")

    return FilterUpdateResponse(
        message="Filter settings updated successfully.",
        link_id=link_id
        # updated_filters=payload.filters # Can be returned if frontend needs immediate confirmation of settings
    )

@router.get("/links/{link_id}/filters", response_model=LinkFilterSettings, tags=["Cloaking Filters"], operation_id="get_link_filter_settings_for_link")
async def get_link_filter_settings_endpoint( # Renamed for clarity from get_link_filter_settings
    link_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the filter configuration for a specific cloaked link. Protected by JWT.
    Returns default settings if no specific configuration is found.
    """
    print(f"User '{current_user.username}' fetching filter settings for link_id: {link_id}")
    filters_storage_key = get_link_filters_storage_key(link_id)
    try:
        filters_data = db.storage.json.get(filters_storage_key)
        if filters_data:
            print(f"Retrieved filter settings for {link_id} from {filters_storage_key}")
            # Pydantic will validate and parse filters_data into LinkFilterSettings
            return LinkFilterSettings(**filters_data)
        else:
            print(f"No specific filter settings found for {link_id} at {filters_storage_key}, returning defaults.")
            return LinkFilterSettings() # Return default settings
    except FileNotFoundError:
        print(f"Filter settings file not found for {link_id} at {filters_storage_key}, returning defaults.")
        return LinkFilterSettings() # Return default settings
    except Exception as e:
        print(f"Error retrieving filter settings for {link_id}: {str(e)}")
        # Depending on desired behavior, either raise 500 or return defaults to prevent frontend errors
        # raise HTTPException(status_code=500, detail=f"Failed to retrieve filter settings: {str(e)}")
        return LinkFilterSettings() # Returning defaults for resilience