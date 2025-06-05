from fastapi import APIRouter, HTTPException, Depends 
from pydantic import BaseModel
from typing import List, Optional

# JWT and User model from security_utils
from app.apis.security_utils import get_current_user, User 

# Main router for cloaked link operations
router = APIRouter(prefix="/links")

class CloakedLinkBase(BaseModel):
    campaign_name: str
    black_page_url_a: str # URL for variant A
    black_page_url_b: Optional[str] = None # URL for variant B, optional
    white_page_url: str

class CloakedLinkCreate(CloakedLinkBase):
    pass

class CloakedLinkResponse(CloakedLinkBase): # Response model should include id
    id: int

# In-memory mock database for cloaked links
# In a real app, use a proper database (e.g., db.storage.json or a SQL/NoSQL DB)
mock_cloaked_links_db: List[CloakedLinkResponse] = [
    CloakedLinkResponse(id=1, campaign_name="Test Campaign 1", black_page_url_a="https://black.a.example.com", black_page_url_b="https://black.b.example.com", white_page_url="https://white.example.com"),
    CloakedLinkResponse(id=2, campaign_name="Summer Sale", black_page_url_a="https://promo.example.com/black-a", black_page_url_b=None, white_page_url="https://safe.example.com/white")
]
next_link_id = 3 # Simple auto-incrementing ID for mock DB

@router.get("", response_model=List[CloakedLinkResponse], operation_id="get_cloaked_links")
async def get_cloaked_links_endpoint(current_user: User = Depends(get_current_user)):
    """Retrieve all cloaked link configurations. Protected by JWT."""
    print(f"User '{current_user.username}' fetching all cloaked links.")
    # TODO: Add Redis caching here if needed
    # TODO: In a multi-user system, filter links by current_user.username if applicable
    return mock_cloaked_links_db

@router.post("", response_model=CloakedLinkResponse, status_code=201, operation_id="create_cloaked_link")
async def create_cloaked_link_endpoint(
    link: CloakedLinkCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new cloaked link configuration. Protected by JWT.
    """
    global next_link_id
    print(f"User '{current_user.username}' creating new cloaked link: {link.campaign_name}")
    new_link_data = link.model_dump()
    new_link = CloakedLinkResponse(
        id=next_link_id,
        **new_link_data
        # user_id=current_user.username # Example if storing user association
    )
    mock_cloaked_links_db.append(new_link)
    next_link_id += 1
    # TODO: Log this creation event to SQLite
    print(f"Created cloaked link: {new_link.campaign_name} (ID: {new_link.id}) for user '{current_user.username}'")
    return new_link

# Placeholder for GET by ID - add if needed
@router.get("/{link_id}", response_model=CloakedLinkResponse, operation_id="get_cloaked_link_by_id")
async def get_cloaked_link_by_id_endpoint(link_id: int, current_user: User = Depends(get_current_user)):
    print(f"User '{current_user.username}' fetching link with id: {link_id}")
    for link_item in mock_cloaked_links_db:
        if link_item.id == link_id:
            # Potentially add user ownership check here
            return link_item
    raise HTTPException(status_code=404, detail=f"Cloaked link with ID {link_id} not found")

# Placeholder for PUT - add if needed
@router.put("/{link_id}", response_model=CloakedLinkResponse, operation_id="update_cloaked_link")
async def update_cloaked_link_endpoint(link_id: int, link_update: CloakedLinkCreate, current_user: User = Depends(get_current_user)):
    print(f"User '{current_user.username}' updating link with id: {link_id}")
    for i, link_item in enumerate(mock_cloaked_links_db):
        if link_item.id == link_id:
            # Potentially check ownership
            updated_link = CloakedLinkResponse(id=link_id, **link_update.model_dump())
            mock_cloaked_links_db[i] = updated_link
            return updated_link
    raise HTTPException(status_code=404, detail=f"Cloaked link with ID {link_id} not found for update")

# Placeholder for DELETE - add if needed
@router.delete("/{link_id}", status_code=204, operation_id="delete_cloaked_link")
async def delete_cloaked_link_endpoint(link_id: int, current_user: User = Depends(get_current_user)):
    print(f"User '{current_user.username}' deleting link with id: {link_id}")
    global mock_cloaked_links_db
    initial_len = len(mock_cloaked_links_db)
    # Potentially check ownership
    mock_cloaked_links_db = [l for l in mock_cloaked_links_db if l.id != link_id]
    if len(mock_cloaked_links_db) == initial_len:
        raise HTTPException(status_code=404, detail=f"Cloaked link with ID {link_id} not found for deletion")
    return None # For 204 No Content
