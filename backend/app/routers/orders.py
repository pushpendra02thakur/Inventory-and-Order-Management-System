from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)

authenticated = Depends(auth.get_current_user)
write_access = Depends(auth.require_role(["Admin", "Manager", "Staff"]))
status_update_access = Depends(auth.require_role(["Admin", "Manager"]))
delete_access = Depends(auth.require_role(["Admin"]))

@router.get("", response_model=List[schemas.OrderResponse])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    return crud.get_orders(db, skip=skip, limit=limit, search=search)

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def read_order_by_id(
    order_id: int,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    order = crud.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order: schemas.OrderCreate,
    current_user: models.User = write_access,
    db: Session = Depends(get_db)
):
    return crud.create_order(db, order, user_id=current_user.id)

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    current_user: models.User = status_update_access,
    db: Session = Depends(get_db)
):
    return crud.update_order_status(db, order_id, status_update, user_id=current_user.id)

@router.delete("/{order_id}", response_model=schemas.OrderResponse)
def cancel_and_delete_order(
    order_id: int,
    current_user: models.User = delete_access,
    db: Session = Depends(get_db)
):
    return crud.delete_order(db, order_id, user_id=current_user.id)
