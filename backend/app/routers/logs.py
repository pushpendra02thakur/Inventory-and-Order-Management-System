from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, crud, auth, models

router = APIRouter(
    prefix="/api/logs",
    tags=["Activity Logs"]
)

admin_only = Depends(auth.require_role(["Admin"]))

@router.get("", response_model=List[schemas.ActivityLogResponse])
def read_activity_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = admin_only,
    db: Session = Depends(get_db)
):
    return crud.get_activity_logs(db, skip=skip, limit=limit)
