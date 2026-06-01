from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

# Authentication and Role dependencies
authenticated = Depends(auth.get_current_user)
write_access = Depends(auth.require_role(["Admin", "Manager"]))
delete_access = Depends(auth.require_role(["Admin"]))

@router.get("", response_model=List[schemas.ProductResponse])
def read_products(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    return crud.get_products(db, skip=skip, limit=limit, search=search)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product_by_id(
    product_id: int,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    product = crud.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_new_product(
    product: schemas.ProductCreate,
    current_user: models.User = write_access,
    db: Session = Depends(get_db)
):
    return crud.create_product(db, product, user_id=current_user.id)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product_details(
    product_id: int,
    product_update: schemas.ProductUpdate,
    current_user: models.User = write_access,
    db: Session = Depends(get_db)
):
    return crud.update_product(db, product_id, product_update, user_id=current_user.id)

@router.delete("/{product_id}", response_model=schemas.ProductResponse)
def remove_product(
    product_id: int,
    current_user: models.User = delete_access,
    db: Session = Depends(get_db)
):
    return crud.delete_product(db, product_id, user_id=current_user.id)
