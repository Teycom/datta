from fastapi import APIRouter, HTTPException, Body, Request
from pydantic import BaseModel, HttpUrl # Adicionado HttpUrl
import requests
import databutton as db

router = APIRouter(prefix="/route_decision", tags=["Cloaking Decision"])

# URLs de fallback caso a configuração não seja encontrada no storage
FALLBACK_BLACK_PAGE_URL = "https://fallback-black.example.com"
FALLBACK_WHITE_PAGE_URL = "https://fallback-white.example.com"
CONFIG_STORAGE_KEY = "cloak_config_urls" # Chave para buscar a configuração no db.storage.json

CLOUDFLARE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

class RouteRequest(BaseModel):
    turnstileToken: str | None = None

class RouteResponse(BaseModel):
    decision: str
    action: str
    url: str # Agora será uma string, pois pode ser HttpUrl ou string de fallback

def get_configured_urls() -> tuple[str, str]:
    """Busca as URLs configuradas do db.storage.json ou retorna fallbacks."""
    try:
        config = db.storage.json.get(CONFIG_STORAGE_KEY)
        if config and isinstance(config, dict) and "white_url" in config and "black_url" in config:
            print(f"[ROUTE_DECISION] URLs configuradas encontradas: White='{config['white_url']}', Black='{config['black_url']}'")
            # As URLs já devem estar como strings no storage
            return str(config["white_url"]), str(config["black_url"])
        else:
            print(f"[ROUTE_DECISION] Nenhuma configuração de URL válida encontrada no storage ou formato incorreto. Usando fallbacks.")
            print(f"[ROUTE_DECISION] Conteúdo do storage para '{CONFIG_STORAGE_KEY}': {config}")
    except Exception as e:
        print(f"[ROUTE_DECISION] Erro ao buscar URLs configuradas do storage: {e}. Usando fallbacks.")
    return FALLBACK_WHITE_PAGE_URL, FALLBACK_BLACK_PAGE_URL

def validate_turnstile_token(token: str | None, remote_ip: str | None) -> bool:
    """Validates the Cloudflare Turnstile token."""
    if not token:
        print("[ROUTE_DECISION] Turnstile token is missing.")
        return False

    secret_key = db.secrets.get("CLOUDFLARE_TURNSTILE_SECRET_KEY")
    if not secret_key:
        print("[ROUTE_DECISION] CLOUDFLARE_TURNSTILE_SECRET_KEY secret not found.")
        return False

    payload = {"secret": secret_key, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    
    try:
        print(f"[ROUTE_DECISION] Validating Turnstile token (first 20 chars): {token[:20] if token else 'None'} for IP: {remote_ip}")
        response = requests.post(CLOUDFLARE_VERIFY_URL, data=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        print(f"[ROUTE_DECISION] Turnstile validation API response: {result}")
        if result.get("success") == True:
            print("[ROUTE_DECISION] Turnstile token is VALID.")
            return True
        else:
            print(f"[ROUTE_DECISION] Turnstile token is INVALID. Error codes: {result.get('error-codes')}")
            return False
    except requests.exceptions.Timeout:
        print(f"[ROUTE_DECISION] Timeout during Turnstile token validation for token: {token[:20] if token else 'None'}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[ROUTE_DECISION] Network error validating Turnstile token: {e}")
        return False
    except Exception as e:
        print(f"[ROUTE_DECISION] An unexpected error occurred during Turnstile validation: {e}")
        return False

@router.post("/route", response_model=RouteResponse, operation_id="get_route_decision") # Mantido o operation_id anterior por compatibilidade com o client TS
async def get_route_decision_endpoint(
    fastapi_request: Request,
    request_body: RouteRequest = Body(...)
):
    """
    Determines whether to show the white page or black page based on Turnstile validation and configured URLs.
    """
    white_page_url_to_use, black_page_url_to_use = get_configured_urls()

    client_ip = fastapi_request.headers.get("cf-connecting-ip")
    if not client_ip:
        x_forwarded_for = fastapi_request.headers.get("x-forwarded-for")
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(',')[0].strip()
    if not client_ip:
        client_ip = fastapi_request.client.host if fastapi_request.client else None

    print(f"[ROUTE_DECISION] Received POST request for /route. Token (first 20): {request_body.turnstileToken[:20] if request_body.turnstileToken else 'None'}. Client IP: {client_ip}")
    
    if not db.secrets.get("CLOUDFLARE_TURNSTILE_SECRET_KEY"):
        print("[ROUTE_DECISION] CRITICAL: Turnstile secret key is not configured. Using fallback white page URL.")
        return RouteResponse(decision="white", action="redirect", url=white_page_url_to_use)

    is_human = validate_turnstile_token(request_body.turnstileToken, remote_ip=client_ip)

    if is_human:
        print(f"[ROUTE_DECISION] Outcome: BLACK_PAGE (Turnstile validation successful). Redirecting to: {black_page_url_to_use}")
        return RouteResponse(decision="black", action="redirect", url=black_page_url_to_use)
    else:
        print(f"[ROUTE_DECISION] Outcome: WHITE_PAGE (Turnstile validation failed). Redirecting to: {white_page_url_to_use}")
        return RouteResponse(decision="white", action="redirect", url=white_page_url_to_use)