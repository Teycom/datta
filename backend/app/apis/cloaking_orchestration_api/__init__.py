from fastapi import APIRouter, HTTPException, Depends, Request as FastAPIRequest
from pydantic import BaseModel, Field
import databutton as db
from typing import List, Dict, Optional, Literal as TypingLiteral # Added TypingLiteral
from app.auth import AuthorizedUser

# Configuration constants
CONFIG_STORAGE_KEY = "phantom_shield_config"
DEFAULT_MAIN_CONFIG = {
    "cloudflare_accounts": {},
    "domains": {},
    "configured_domains": {} # Ensure this key exists for domain_management_api
}

router = APIRouter(prefix="/api/v1/cloaking", tags=["Cloaking Orchestration"])

# --- Pydantic Models for Domain/Cloudflare Configuration (used by Domain Management API) ---
class CloudflareAccountStoredDetails(BaseModel):
    identifier: str # User-given name for the CF account, or an email, etc.
    api_token_secret_key_encrypted: str # The CF API Token, encrypted
    status: TypingLiteral["pending_verification", "verified", "error_verification", "revoked"] = "pending_verification"
    added_by: str # User ID (from AuthorizedUser.sub) or a system identifier like "system_init"
    added_at: str # ISO 8601 timestamp
    cf_account_id: Optional[str] = None # Cloudflare's internal Account ID, fetched after verification
    cf_user_id: Optional[str] = None # Cloudflare's internal User ID, if available
    cf_token_id: Optional[str] = None # Cloudflare's internal API Token ID, fetched after verification
    last_verification_attempt: Optional[str] = None # ISO 8601 timestamp
    last_verification_error: Optional[str] = None

class ConfiguredDomainDetails(BaseModel):
    domain_name: str # The FQDN, e.g., "my-cool-site.com"
    # Key from the 'cloudflare_accounts' in the main_config dict, linking this domain to a CF account
    cloudflare_account_storage_key: str 
    cf_zone_id: Optional[str] = None # Cloudflare's internal Zone ID for this domain
    cf_kv_namespace_id: Optional[str] = None # Cloudflare KV Namespace ID for this domain's campaigns
    cf_worker_script_name: Optional[str] = None # Name of the deployed Cloudflare Worker script
    # Auth token the worker uses to call back to this app's /decide-cloak endpoint
    app_worker_auth_token: Optional[str] = None 
    nameservers: Optional[List[str]] = None # Nameservers Cloudflare assigns if zone created here
    status: TypingLiteral["pending_verification", "pending_nameserver_update", "active", "error", "disabled"] = "pending_verification"
    last_configured_at: Optional[str] = None # ISO 8601 timestamp
\
    last_error_message: Optional[str] = None
    txt_verification_token: Optional[str] = Field(None, description="Token for TXT record domain verification.")
    txt_verification_hostname: Optional[str] = Field(None, description="Hostname for TXT record verification (e.g., _phantomshield-verification.domain.com).")
    txt_verification_status: Optional[TypingLiteral["pending", "verified", "failed", "not_started"]] = Field("not_started", description="Status of TXT record verification.")


# --- Pydantic Models for Campaign Management ---


class CampaignFiltersModel(BaseModel):
    user_agent_contains_block: List[str] = Field(default_factory=list, description="List of User-Agent substrings to block (show White Page). Case-insensitive.")
    geo_country_block: List[str] = Field(default_factory=list, description="List of 2-letter country codes (ISO 3166-1 alpha-2) to block. Case-insensitive (will be uppercased).")
    # TODO: Add device_os_block: Optional[List[str]] = Field(default_factory=list)
    # TODO: Add ip_range_block: Optional[List[str]] = Field(default_factory=list)
    # TODO: Add ip_range_allow: Optional[List[str]] = Field(default_factory=list)

class CampaignConfig(BaseModel):
    # path: str # Path is the key in the dictionary, not part of the model itself
    white_content: str = Field(description="HTML content for the White Page.")
    black_content: str = Field(description="HTML content for the Black Page.")
    filters: CampaignFiltersModel = Field(default_factory=CampaignFiltersModel)
    created_at: Optional[str] = None # ISO 8601 format
    updated_at: Optional[str] = None # ISO 8601 format

class CampaignCreateRequest(BaseModel):
    domain_name: str
    path: str = Field(description="Unique path/slug for the campaign under the domain. Ex: 'promo1', 'exclusive-offer'")
    white_content: str
    black_content: str
    filters: Optional[CampaignFiltersModel] = Field(default_factory=CampaignFiltersModel)

class CampaignUpdateRequestData(BaseModel): # Data part of the update, path is in URL
    white_content: Optional[str] = None
    black_content: Optional[str] = None
    filters: Optional[CampaignFiltersModel] = None

class CampaignUpdateRequest(BaseModel):
    domain_name: str
    path: str # Original path to identify the campaign
    update_data: CampaignUpdateRequestData

class CampaignBriefResponse(BaseModel):
    path: str
    white_content_snippet: Optional[str] = None # Or just a flag like has_white_content
    black_content_snippet: Optional[str] = None # Or just a flag like has_black_content
    filters_summary: Optional[str] = None # e.g., "UA: 3, Geo: 2"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    # Add all fields from CampaignConfig to allow full editing in frontend
    white_content: str
    black_content: str
    filters: CampaignFiltersModel


class CampaignsListResponse(BaseModel):
    domain_name: str
    campaigns: List[CampaignBriefResponse] = Field(default_factory=list)

class CampaignDeleteResponse(BaseModel):
    message: str
    domain_name: str
    path: str

# --- Pydantic Models for Cloaking Decision ---

class DecideCloakRequest(BaseModel):
    host: str
    path: str
    headers: dict # Raw headers from the request

class DecideCloakResponse(BaseModel):
    content: str
    content_type: str = "text/html"

# --- Helper Functions ---

def get_main_config() -> Dict:
    return db.storage.json.get(CONFIG_STORAGE_KEY, default=DEFAULT_MAIN_CONFIG)

def save_main_config(config: Dict):
    db.storage.json.put(CONFIG_STORAGE_KEY, config)

# --- API Endpoints ---

@router.post("/campaigns", response_model=CampaignBriefResponse, status_code=201)
async def create_campaign(campaign_data: CampaignCreateRequest, user: AuthorizedUser):
    main_config = get_main_config()
    domain_config = main_config.get("domains", {}).get(campaign_data.domain_name)

    if not domain_config:
        raise HTTPException(status_code=404, detail=f"Domain '{campaign_data.domain_name}' not found or not configured.")
    
    if domain_config.get("status") != "active":
        raise HTTPException(status_code=400, detail=f"Domain '{campaign_data.domain_name}' is not active. Cannot add campaigns.")

    # Normalize path
    normalized_path = campaign_data.path.strip("/")
    if not normalized_path: # Path cannot be empty or just slashes
        raise HTTPException(status_code=400, detail="Campaign path cannot be empty.")
    if "/" in normalized_path: # For now, disallow nested paths for simplicity, can be relaxed later
        raise HTTPException(status_code=400, detail="Campaign path cannot contain '/' characters (nested paths not supported yet).")


    if "campaigns" not in domain_config:
        domain_config["campaigns"] = {}
    
    if normalized_path in domain_config["campaigns"]:
        raise HTTPException(status_code=400, detail=f"Campaign path '{normalized_path}' already exists for domain '{campaign_data.domain_name}'.")

    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()

    new_campaign = CampaignConfig(
        white_content=campaign_data.white_content,
        black_content=campaign_data.black_content,
        filters=campaign_data.filters if campaign_data.filters else CampaignFiltersModel(),
        created_at=now_iso,
        updated_at=now_iso
    )
    domain_config["campaigns"][normalized_path] = new_campaign.model_dump(exclude_none=True)
    
    main_config["domains"][campaign_data.domain_name] = domain_config
    save_main_config(main_config)

    return CampaignBriefResponse(
        path=normalized_path,
        white_content=new_campaign.white_content,
        black_content=new_campaign.black_content,
        filters=new_campaign.filters,
        created_at=new_campaign.created_at,
        updated_at=new_campaign.updated_at,
        # For snippet/summary, you might truncate or process content/filters here
        white_content_snippet=new_campaign.white_content[:50] + "..." if len(new_campaign.white_content) > 50 else new_campaign.white_content,
        black_content_snippet=new_campaign.black_content[:50] + "..." if len(new_campaign.black_content) > 50 else new_campaign.black_content,
        filters_summary=f"UA: {len(new_campaign.filters.user_agent_contains_block)}, Geo: {len(new_campaign.filters.geo_country_block)}"
    )

@router.get("/campaigns/{domain_name}", response_model=CampaignsListResponse)
async def list_campaigns_for_domain(domain_name: str, user: AuthorizedUser):
    main_config = get_main_config()
    domain_config = main_config.get("domains", {}).get(domain_name)

    if not domain_config:
        raise HTTPException(status_code=404, detail=f"Domain '{domain_name}' not found.")

    campaigns_dict = domain_config.get("campaigns", {})
    campaign_list = []
    for path, camp_data in campaigns_dict.items():
        # Ensure camp_data has all fields for CampaignConfig before parsing, providing defaults if necessary
        parsed_config = CampaignConfig(**camp_data) # This loads the stored dict into the Pydantic model
        campaign_list.append(CampaignBriefResponse(
            path=path,
            white_content=parsed_config.white_content,
            black_content=parsed_config.black_content,
            filters=parsed_config.filters,
            created_at=parsed_config.created_at,
            updated_at=parsed_config.updated_at,
            white_content_snippet=parsed_config.white_content[:50] + "..." if len(parsed_config.white_content) > 50 else parsed_config.white_content,
            black_content_snippet=parsed_config.black_content[:50] + "..." if len(parsed_config.black_content) > 50 else parsed_config.black_content,
            filters_summary=f"UA: {len(parsed_config.filters.user_agent_contains_block)}, Geo: {len(parsed_config.filters.geo_country_block)}"
        ))
    return CampaignsListResponse(domain_name=domain_name, campaigns=campaign_list)

@router.put("/campaigns/{domain_name}/{path}", response_model=CampaignBriefResponse)
async def update_campaign(domain_name: str, path: str, update_data_req: CampaignUpdateRequestData, user: AuthorizedUser):
    main_config = get_main_config()
    domain_config = main_config.get("domains", {}).get(domain_name)
    normalized_path = path.strip("/")

    if not domain_config or normalized_path not in domain_config.get("campaigns", {}):
        raise HTTPException(status_code=404, detail=f"Campaign '{normalized_path}' not found for domain '{domain_name}'.")

    existing_campaign_dict = domain_config["campaigns"][normalized_path]
    # Load existing data into Pydantic model to easily update and validate
    existing_campaign_model = CampaignConfig(**existing_campaign_dict)

    update_data_dict = update_data_req.model_dump(exclude_unset=True) # Get only fields that were actually sent

    if 'white_content' in update_data_dict:
        existing_campaign_model.white_content = update_data_dict['white_content']
    if 'black_content' in update_data_dict:
        existing_campaign_model.black_content = update_data_dict['black_content']
    if 'filters' in update_data_dict: # If filters are sent, they replace existing filters
        existing_campaign_model.filters = CampaignFiltersModel(**update_data_dict['filters'])
    
    from datetime import datetime, timezone
    existing_campaign_model.updated_at = datetime.now(timezone.utc).isoformat()

    domain_config["campaigns"][normalized_path] = existing_campaign_model.model_dump(exclude_none=True)
    main_config["domains"][domain_name] = domain_config
    save_main_config(main_config)
    
    return CampaignBriefResponse(
        path=normalized_path,
        white_content=existing_campaign_model.white_content,
        black_content=existing_campaign_model.black_content,
        filters=existing_campaign_model.filters,
        created_at=existing_campaign_model.created_at,
        updated_at=existing_campaign_model.updated_at,
        white_content_snippet=existing_campaign_model.white_content[:50] + "..." if len(existing_campaign_model.white_content) > 50 else existing_campaign_model.white_content,
        black_content_snippet=existing_campaign_model.black_content[:50] + "..." if len(existing_campaign_model.black_content) > 50 else existing_campaign_model.black_content,
        filters_summary=f"UA: {len(existing_campaign_model.filters.user_agent_contains_block)}, Geo: {len(existing_campaign_model.filters.geo_country_block)}"
    )

@router.delete("/campaigns/{domain_name}/{path}", response_model=CampaignDeleteResponse)
async def delete_campaign(domain_name: str, path: str, user: AuthorizedUser):
    main_config = get_main_config()
    domain_config = main_config.get("domains", {}).get(domain_name)
    normalized_path = path.strip("/")

    if not domain_config or normalized_path not in domain_config.get("campaigns", {}):
        raise HTTPException(status_code=404, detail=f"Campaign '{normalized_path}' not found for domain '{domain_name}'.")

    del domain_config["campaigns"][normalized_path]
    
    # If campaigns becomes empty, remove the key for cleanliness
    if not domain_config["campaigns"]:
        del domain_config["campaigns"]

    main_config["domains"][domain_name] = domain_config
    save_main_config(main_config)
    
    return CampaignDeleteResponse(message=f"Campaign '{normalized_path}' deleted successfully from domain '{domain_name}'.", domain_name=domain_name, path=normalized_path)


@router.post("/decide-cloak", response_model=DecideCloakResponse)
async def decide_cloak_endpoint(request_data: DecideCloakRequest):
    """
    Main endpoint for cloaking decision. Called by the Cloudflare worker.
    Receives host, path, and headers, and returns the appropriate content (White or Black page).
    """
    main_config = get_main_config() # Uses helper for consistency
    domain_config = main_config.get("domains", {}).get(request_data.host)

    if not domain_config or domain_config.get("status") != "active":
        # Using 404 as per CF worker example for simplicity.
        # Actual content doesn't matter much as CF Worker checks response.json().error
        raise HTTPException(status_code=404, detail={"error": "Domain not configured or not active."})

    campaigns_for_domain = domain_config.get("campaigns", {})
    normalized_path = request_data.path.strip("/") # Ensure consistent path matching
    
    # Handle empty path (root path) for a domain, if desired as a special campaign (e.g., path='')
    # For now, an empty normalized_path means it wasn't found unless explicitly configured with key ""
    campaign_dict = campaigns_for_domain.get(normalized_path)

    if not campaign_dict:
        raise HTTPException(status_code=404, detail={"error": f"Campaign not found for path: '{normalized_path}' on host: '{request_data.host}'"})
    
    # Parse campaign_dict into CampaignConfig model for easier access and validation
    try:
        campaign = CampaignConfig(**campaign_dict)
    except Exception as e: # Broad exception for Pydantic validation or missing fields
        print(f"Error parsing campaign config for {request_data.host}/{normalized_path}: {e}")
        # Fallback to a generic safe page or error. For CF worker, error in JSON is key.
        raise HTTPException(status_code=500, detail={"error": "Error processing campaign configuration."})

    serve_white_page = False
    reason_for_white = ""

    # 1. User-Agent Filter
    user_agent_header = request_data.headers.get("user-agent", "") # case-insensitive by default from CF
    ua_blocks = campaign.filters.user_agent_contains_block
    if ua_blocks:
        for ua_pattern in ua_blocks:
            if ua_pattern.lower() in user_agent_header.lower(): # Ensure case-insensitive match
                serve_white_page = True
                reason_for_white = f"User-Agent matched: {ua_pattern}"
                break
    
    # 2. Geolocation (CF-IPCountry) Filter
    if not serve_white_page:
        # CF-IPCountry header is typically provided by Cloudflare
        cf_ip_country_header = request_data.headers.get("cf-ipcountry", "").upper()
        geo_blocks = campaign.filters.geo_country_block # Already uppercased on save
        if geo_blocks and cf_ip_country_header:
            if cf_ip_country_header in geo_blocks: # geo_blocks are stored uppercase
                serve_white_page = True
                reason_for_white = f"CF-IPCountry matched: {cf_ip_country_header}"
    
    # Simple logging for now
    log_message = (
        f"Decision for {request_data.host}/{normalized_path}: "
        f"UA='{user_agent_header}', CF_Country='{request_data.headers.get('cf-ipcountry', 'N/A')}'"
    )

    if serve_white_page:
        print(f"{log_message} -> SERVING WHITE. Reason: {reason_for_white}")
        return DecideCloakResponse(content=campaign.white_content)
    else:
        print(f"{log_message} -> SERVING BLACK.")
        return DecideCloakResponse(content=campaign.black_content)

