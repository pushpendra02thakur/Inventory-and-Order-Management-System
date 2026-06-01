from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)

authenticated = Depends(auth.get_current_user)
write_access = Depends(auth.require_role(["Admin", "Manager"]))
delete_access = Depends(auth.require_role(["Admin"]))

@router.get("", response_model=List[schemas.CustomerResponse])
def read_customers(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    return crud.get_customers(db, skip=skip, limit=limit, search=search)

@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def read_customer_by_id(
    customer_id: int,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    customer = crud.get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_new_customer(
    customer: schemas.CustomerCreate,
    current_user: models.User = write_access,
    db: Session = Depends(get_db)
):
    return crud.create_customer(db, customer, user_id=current_user.id)

@router.put("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer_details(
    customer_id: int,
    customer_update: schemas.CustomerUpdate,
    current_user: models.User = write_access,
    db: Session = Depends(get_db)
):
    return crud.update_customer(db, customer_id, customer_update, user_id=current_user.id)

@router.delete("/{customer_id}", response_model=schemas.CustomerResponse)
def remove_customer(
    customer_id: int,
    current_user: models.User = delete_access,
    db: Session = Depends(get_db)
):
    return crud.delete_customer(db, customer_id, user_id=current_user.id)
