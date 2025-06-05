from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Annotated

from app.apis.security_utils import create_access_token, User, get_current_user # Ensure get_current_user is imported
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"]) # Added tags for better OpenAPI docs

class Token(BaseModel):
    access_token: str
    token_type: str

# This is a mock user database. In a real application, you would query your database.
# For Phantom Shield, user management might be simple or integrated with another system.
# For now, let's assume a single, hardcoded admin user for simplicity to get the token.
MOCK_USERS_DB = {
    "admin@phantoms.com": {
        "username": "admin@phantoms.com",
        "full_name": "Admin User",
        "email": "admin@phantoms.com",
        "hashed_password": "fakedhashedpassword", # In a real app, this would be a securely hashed password
        "disabled": False,
    }
}

# Mock password verification. Replace with a secure password hashing and verification library (e.g., passlib).
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # In a real scenario: return pwd_context.verify(plain_password, hashed_password)
    # For this mock: we are not actually checking the password, just that the user exists.
    # This is highly insecure and only for demonstration of the token endpoint flow.
    print(f"MOCK: Verifying password for user. Plain: {plain_password}, Hashed: {hashed_password}")
    return True # In a real app, this must be a secure comparison

@router.post("/token", response_model=Token, operation_id="login_for_access_token")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    """
    Provides a JWT access token upon successful authentication (username/password).
    Uses OAuth2PasswordRequestForm for input, meaning frontend should send form-encoded data.
    For Phantom Shield, initially, we might only have one admin user or a simple auth scheme.
    """
    print(f"Attempting login for user: {form_data.username}")
    user = MOCK_USERS_DB.get(form_data.username)
    if not user or user["disabled"]:
        print(f"Login failed: User '{form_data.username}' not found or disabled.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # IMPORTANT: Replace this with actual password verification!
    if not verify_password(form_data.password, user["hashed_password"]):
        print(f"Login failed: Incorrect password for user '{form_data.username}'.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password", # Keep generic for security
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Define token expiration time (e.g., 1 day, 7 days, etc.)
    # For Phantom Shield, a longer session might be acceptable for the admin panel
    access_token_expires = timedelta(days=1) 
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    print(f"Login successful for user '{form_data.username}'. Token generated.")
    return Token(access_token=access_token, token_type="bearer")


@router.get("/users/me", response_model=User, operation_id="read_users_me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    """Fetch details for the currently authenticated user."""
    # The current_user object is already populated by get_current_user dependency
    # You might want to return more user details if your User model has them
    print(f"Fetching details for current user: {current_user.username}")
    # In a real app, you might fetch more details from a DB based on current_user.username
    # For this example, the User model only has 'username'
    return current_user
