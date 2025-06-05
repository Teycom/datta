# This file will house shared security utility functions, like JWT validation.
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel # Ensure BaseModel is imported
import jwt # PyJWT library - ensure it's in requirements.txt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError # Ensure specific exceptions are imported
import databutton as db # Import databutton to access secrets
from datetime import datetime, timedelta, timezone # Ensure all datetime components are imported

# Algorithm for JWT
ALGORITHM = "HS256"

# OAuth2PasswordBearer scheme. 
# tokenUrl should ideally point to your token generation endpoint.
# auto_error=True will automatically return a 401 if the token is not present or invalid.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=True)

class User(BaseModel): # Basic user model for typing, can be expanded
    username: str
    # email: str | None = None # Optional: if you want to include more user data
    # full_name: str | None = None
    # disabled: bool | None = None

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Decodes the JWT token from the Authorization header, validates it, and returns user data.
    Raises HTTPException if the token is invalid, expired, or not present.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials - Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        jwt_secret = db.secrets.get("JWT_SECRET_KEY")
        if not jwt_secret:
            print("ERROR: JWT_SECRET_KEY not found in Databutton secrets!")
            # This is a server-side configuration error
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="JWT secret not configured on server.")
        
        payload = jwt.decode(token, jwt_secret, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub") # "sub" is a standard claim for subject (username)
        
        if username is None:
            print("JWT token payload missing 'sub' (username)")
            raise credentials_exception
        
        # You could add more checks here, e.g., token type, specific claims, or load user from DB
        # For now, we only care about the username present in the token's subject.
        print(f"User '{username}' authenticated successfully via JWT.")
        return User(username=username)
    except ExpiredSignatureError:
        print("JWT token has expired.")
        raise credentials_exception # Reraise with the correct status and detail
    except InvalidTokenError as e:
        print(f"Invalid JWT token: {e}")
        raise credentials_exception # Reraise with the correct status and detail
    except Exception as e:
        # Catch any other unexpected errors during token processing
        print(f"Auth Error in get_current_user: An unexpected error occurred - {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication processing.",
        )

# Function to create a JWT token (Will be used by the login endpoint)
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    # Set token expiration
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default to a reasonable expiration time, e.g., 1 hour (adjust as needed for Phantom Shield)
        expire = datetime.now(timezone.utc) + timedelta(minutes=60) 
    
    to_encode.update({
        "exp": expire, 
        "iat": datetime.now(timezone.utc), # Issued At claim
        # You can add other claims here if needed, e.g., "iss" (issuer), "aud" (audience)
    })
    
    jwt_secret = db.secrets.get("JWT_SECRET_KEY")
    if not jwt_secret:
        print("ERROR: JWT_SECRET_KEY not found for token creation!")
        # This is a critical server configuration error if it happens during token creation
        raise HTTPException(status_code=500, detail="JWT secret not configured, cannot create token.")

    encoded_jwt = jwt.encode(to_encode, jwt_secret, algorithm=ALGORITHM)
    return encoded_jwt

# Add a dummy router to satisfy the framework for API modules
from fastapi import APIRouter
router = APIRouter()