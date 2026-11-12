from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.dashboard import DashboardOverviewResponse

from app.services.dashboard_service import (
    get_dashboard_overview,
    InvalidDashboardPeriodError,
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/overview",
    response_model=DashboardOverviewResponse,
)
def dashboard_overview(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    # Default to the current calendar month.
    effective_start_date = start_date or today.replace(day=1)
    effective_end_date = end_date or today

    try:
        return get_dashboard_overview(
            db=db,
            user_id=current_user.id,
            start_date=effective_start_date,
            end_date=effective_end_date,
        )

    except InvalidDashboardPeriodError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        )