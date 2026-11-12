from datetime import date
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.savings_contribution import (
    SavingsContributionCreate,
    SavingsContributionResponse,
    SavingsContributionListResponse,
)

from app.services import savings_contribution_service


router = APIRouter(
    prefix="/api/v1/savings-goals/{goal_id}/contributions",
    tags=["Savings Contributions"],
)


@router.post(
    "",
    response_model=SavingsContributionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contribution(
    goal_id: UUID,
    contribution_data: SavingsContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return savings_contribution_service.create_contribution(
            db=db,
            goal_id=goal_id,
            user_id=current_user.id,
            amount=contribution_data.amount,
            contribution_type=contribution_data.contribution_type,
            description=contribution_data.description,
            contribution_date=contribution_data.contribution_date,
        )

    except savings_contribution_service.SavingsContributionGoalNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except savings_contribution_service.InsufficientSavingsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

    except savings_contribution_service.InvalidSavingsContributionError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "",
    response_model=SavingsContributionListResponse,
)
def get_contributions(
    goal_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort_order: str = Query(default="desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return savings_contribution_service.get_contributions(
            db=db,
            goal_id=goal_id,
            user_id=current_user.id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size,
            sort_order=sort_order,
        )

    except savings_contribution_service.SavingsContributionGoalNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except savings_contribution_service.InvalidSavingsContributionError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )