from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.enums.transaction_type import TransactionType
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
)
from app.services import transaction_service


router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return transaction_service.create_transaction(
            db=db,
            user_id=current_user.id,
            title=transaction_data.title,
            amount=transaction_data.amount,
            transaction_type=transaction_data.type,
            category_id=transaction_data.category_id,
            description=transaction_data.description,
            transaction_date=transaction_data.transaction_date,
        )

    except transaction_service.TransactionCategoryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except transaction_service.TransactionCategoryTypeMismatchError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )

    except transaction_service.InvalidTransactionDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "",
    response_model=TransactionListResponse,
)
def get_transactions(
    transaction_type: TransactionType | None = Query(default=None, alias="type"),
    category_id: UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort_by: str = Query(default="transaction_date"),
    sort_order: str = Query(default="desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return transaction_service.get_transactions(
            db=db,
            user_id=current_user.id,
            transaction_type=transaction_type,
            category_id=category_id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    except transaction_service.TransactionCategoryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except transaction_service.TransactionCategoryTypeMismatchError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )

    except transaction_service.InvalidTransactionDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "/summary",
)
def get_transaction_summary(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return transaction_service.get_transaction_totals(
            db=db,
            user_id=current_user.id,
            start_date=start_date,
            end_date=end_date,
        )

    except transaction_service.InvalidTransactionDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
)
def get_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return transaction_service.get_transaction(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id,
        )

    except transaction_service.TransactionNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


@router.put(
    "/{transaction_id}",
    response_model=TransactionResponse,
)
def update_transaction(
    transaction_id: UUID,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        update_data = transaction_data.model_dump(
            exclude_unset=True
        )

        return transaction_service.update_transaction(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id,
            update_data=update_data,
        )

    except transaction_service.TransactionNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except transaction_service.TransactionCategoryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except transaction_service.TransactionCategoryTypeMismatchError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )

    except transaction_service.InvalidTransactionDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        )


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        transaction_service.delete_transaction(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id,
        )

    except transaction_service.TransactionNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )