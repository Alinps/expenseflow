from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetDetailResponse,
    BudgetListResponse,
)

from app.services import budget_service


router = APIRouter(
    prefix="/api/v1/budgets",
    tags=["Budgets"],
)


@router.post(
    "",
    response_model=BudgetDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return budget_service.create_budget(
            db=db,
            user_id=current_user.id,
            category_id=budget_data.category_id,
            monthly_limit=budget_data.monthly_limit,
            month=budget_data.month,
            year=budget_data.year,
        )

    except budget_service.BudgetCategoryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except budget_service.InvalidBudgetCategoryError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )

    except budget_service.DuplicateBudgetError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

    except budget_service.InvalidBudgetDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "",
    response_model=BudgetListResponse,
)
def get_budgets(
    month: int = Query(ge=1, le=12),
    year: int = Query(ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return budget_service.get_budgets(
            db=db,
            user_id=current_user.id,
            month=month,
            year=year,
        )

    except budget_service.InvalidBudgetDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "/{budget_id}",
    response_model=BudgetDetailResponse,
)
def get_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return budget_service.get_budget(
            db=db,
            budget_id=budget_id,
            user_id=current_user.id,
        )

    except budget_service.BudgetNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


@router.put(
    "/{budget_id}",
    response_model=BudgetDetailResponse,
)
def update_budget(
    budget_id: UUID,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return budget_service.update_budget(
            db=db,
            budget_id=budget_id,
            user_id=current_user.id,
            monthly_limit=budget_data.monthly_limit,
        )

    except budget_service.BudgetNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except budget_service.InvalidBudgetDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.delete(
    "/{budget_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        budget_service.delete_budget(
            db=db,
            budget_id=budget_id,
            user_id=current_user.id,
        )

    except budget_service.BudgetNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )