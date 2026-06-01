from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from .. import schemas, crud, auth, models
from ..config import settings

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Standard sign up defaults to 'Staff' role
    user.role = "Staff"
    # Seed context creator is set to 0 for self-registration
    return crud.create_user(db, user, creator_id=0)

@router.post("/login", response_model=schemas.Token)
def login_user(login_data: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, login_data.username)
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    token_payload = {"sub": user.username, "role": user.role}
    access_token = auth.create_access_token(data=token_payload, expires_delta=access_token_expires)
    refresh_token = auth.create_refresh_token(data=token_payload, expires_delta=refresh_token_expires)
    
    crud.create_activity_log(
        db=db,
        user_id=user.id,
        action="User Login",
        details=f"Successful login for user {user.username}",
        ip_address=request.client.host if request.client else None
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout_user(request: Request, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.create_activity_log(
        db=db,
        user_id=current_user.id,
        action="User Logout",
        details=f"User {current_user.username} logged out",
        ip_address=request.client.host if request.client else None
    )
    return {"message": "Successfully logged out"}

@router.post("/refresh")
def refresh_access_token(refresh_request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    # Validate refresh token
    token_data = auth.verify_token(refresh_request.refresh_token, is_refresh=True)
    user = crud.get_user_by_username(db, token_data["username"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid token or user deactivated")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_current_user_profile(
    profile_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Security constraint: non-admins cannot escalate their role
    if profile_update.role and current_user.role != "Admin":
        profile_update.role = current_user.role
    return crud.update_user(db, current_user.id, profile_update, updater_id=current_user.id)

