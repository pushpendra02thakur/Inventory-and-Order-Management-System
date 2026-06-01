from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"]
)

authenticated = Depends(auth.get_current_user)

@router.get("/history", response_model=List[schemas.InventoryTransactionResponse])
def read_inventory_history(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = authenticated,
    db: Session = Depends(get_db)
):
    return crud.get_inventory_history(db, skip=skip, limit=limit)
