from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.savings_goal import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoalDetailResponse,
    SavingsGoalListResponse,
)

from app.services import savings_goal_service


router = APIRouter(
    prefix="/api/v1/savings-goals",
    tags=["Savings Goals"],
)


@router.post(
    "",
    response_model=SavingsGoalDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_savings_goal(
    goal_data: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return savings_goal_service.create_savings_goal(
            db=db,
            user_id=current_user.id,
            goal_name=goal_data.goal_name,
            target_amount=goal_data.target_amount,
            target_date=goal_data.target_date,
        )

    except savings_goal_service.InvalidSavingsGoalDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "",
    response_model=SavingsGoalListResponse,
)
def get_savings_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return savings_goal_service.get_savings_goals(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{goal_id}",
    response_model=SavingsGoalDetailResponse,
)
def get_savings_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return savings_goal_service.get_savings_goal(
            db=db,
            goal_id=goal_id,
            user_id=current_user.id,
        )

    except savings_goal_service.SavingsGoalNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


@router.put(
    "/{goal_id}",
    response_model=SavingsGoalDetailResponse,
)
def update_savings_goal(
    goal_id: UUID,
    goal_data: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        update_data = goal_data.model_dump(
            exclude_unset=True
        )

        return savings_goal_service.update_savings_goal(
            db=db,
            goal_id=goal_id,
            user_id=current_user.id,
            update_data=update_data,
        )

    except savings_goal_service.SavingsGoalNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except savings_goal_service.InvalidSavingsGoalDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.delete(
    "/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_savings_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        savings_goal_service.delete_savings_goal(
            db=db,
            goal_id=goal_id,
            user_id=current_user.id,
        )

    except savings_goal_service.SavingsGoalNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except savings_goal_service.SavingsGoalHasContributionsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

    except savings_goal_service.InvalidSavingsGoalDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )