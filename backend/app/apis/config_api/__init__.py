from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import databutton as db
# from app.auth import AuthorizedUser # Importar AuthorizedUser - REMOVIDO TEMPORARIAMENTE

router = APIRouter(prefix="/config", tags=["Configuration"])

CONFIG_STORAGE_KEY = "cloak_config_urls"

class CloakUrls(BaseModel):
    white_url: HttpUrl
    black_url: HttpUrl

class UpdateResponse(BaseModel):
    message: str
    current_config: CloakUrls | None = None

@router.post("/update_cloak_urls", response_model=UpdateResponse)
async def update_cloak_urls(urls: CloakUrls): # REMOVIDO user: AuthorizedUser
    """
    Atualiza as URLs para as páginas white e black.
    TEMPORARIAMENTE PÚBLICO.
    """
    try:
        print(f"[CONFIG_API] Atualizando URLs: White='{urls.white_url}', Black='{urls.black_url}' (endpoint público)")
        config_to_save = {
            "white_url": str(urls.white_url),
            "black_url": str(urls.black_url)
        }
        db.storage.json.put(CONFIG_STORAGE_KEY, config_to_save)
        print(f"[CONFIG_API] URLs salvas com sucesso no storage com a chave '{CONFIG_STORAGE_KEY}'.")
        return UpdateResponse(
            message="URLs de cloaking atualizadas com sucesso.",
            current_config=CloakUrls(white_url=urls.white_url, black_url=urls.black_url)
        )
    except Exception as e:
        print(f"[CONFIG_API] Erro ao atualizar URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno ao atualizar URLs: {str(e)}") from e

@router.get("/get_cloak_urls", response_model=CloakUrls | None)
async def get_cloak_urls(): # REMOVIDO user: AuthorizedUser
    """
    Retorna as URLs de cloaking atualmente configuradas.
    TEMPORARIAMENTE PÚBLICO.
    """
    try:
        print(f"[CONFIG_API] Solicitando URLs configuradas da chave '{CONFIG_STORAGE_KEY}' (endpoint público).")
        current_config_dict = db.storage.json.get(CONFIG_STORAGE_KEY)
        if current_config_dict:
            print(f"[CONFIG_API] Configuração encontrada: {current_config_dict}")
            return CloakUrls(white_url=current_config_dict['white_url'], black_url=current_config_dict['black_url'])
        else:
            print(f"[CONFIG_API] Nenhuma configuração de URL encontrada para a chave '{CONFIG_STORAGE_KEY}'.")
            return None # FastAPI converterá para JSON `null` com status 200 se não houver erro.
    except FileNotFoundError: # Especificamente para db.storage.json.get se a chave não existe
        print(f"[CONFIG_API] Nenhuma configuração de URL (FileNotFound) para a chave '{CONFIG_STORAGE_KEY}'.")
        return None # FastAPI converterá para JSON `null`
    except Exception as e:
        print(f"[CONFIG_API] Erro ao obter URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno ao obter URLs: {str(e)}") from e