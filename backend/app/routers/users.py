from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

# Admin role verification dependency
admin_only = Depends(auth.require_role(["Admin"]))

@router.get("", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: models.User = admin_only,
    db: Session = Depends(get_db)
):
    return crud.get_users(db, skip=skip, limit=limit, search=search)

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user: schemas.UserCreate,
    current_user: models.User = admin_only,
    db: Session = Depends(get_db)
):
    return crud.create_user(db, user, creator_id=current_user.id)

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user_details(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = admin_only,
    db: Session = Depends(get_db)
):
    return crud.update_user(db, user_id, user_update, updater_id=current_user.id)

@router.delete("/{user_id}", response_model=schemas.UserResponse)
def remove_user(
    user_id: int,
    current_user: models.User = admin_only,
    db: Session = Depends(get_db)
):
    return crud.delete_user(db, user_id, deleter_id=current_user.id)
