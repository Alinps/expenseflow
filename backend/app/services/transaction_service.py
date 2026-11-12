from datetime import date
from decimal import Decimal
from math import ceil
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.enums.transaction_type import TransactionType
from app.models.transaction import Transaction
from app.repositories import (
    category_repository,
    transaction_repository,
)



class TransactionNotFoundError(Exception):
    pass


class TransactionCategoryNotFoundError(Exception):
    pass


class TransactionCategoryTypeMismatchError(Exception):
    pass


class InvalidTransactionDataError(Exception):
    pass


ALLOWED_SORT_FIELDS = {
    "transaction_date",
    "amount",
    "created_at",
}

ALLOWED_SORT_ORDERS = {"asc", "desc"}

MAX_PAGE_SIZE = 100


def create_transaction(
    db: Session,
    user_id: UUID,
    title: str,
    amount: Decimal,
    transaction_type: TransactionType,
    category_id: UUID,
    description: str | None,
    transaction_date: date,
) -> Transaction:

    # 1. Validate category ownership.
    category = category_repository.get_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        raise TransactionCategoryNotFoundError(
            "Category not found."
        )

    # 2. Validate category type.
    if category.type != transaction_type:
        raise TransactionCategoryTypeMismatchError(
            "Transaction type must match the category type."
        )

    # 3. Validate business data.
    title = title.strip()

    if len(title) < 2:
        raise InvalidTransactionDataError(
            "Transaction title must contain at least 2 characters."
        )

    if amount <= 0:
        raise InvalidTransactionDataError(
            "Transaction amount must be greater than zero."
        )

    # 4. Create transaction.
    transaction = Transaction(
        user_id=user_id,
        category_id=category_id,
        title=title,
        amount=amount,
        type=transaction_type,
        description=description.strip() if description else None,
        transaction_date=transaction_date,
    )

    try:
        transaction_repository.create_transaction(
            db=db,
            transaction=transaction,
        )

        db.commit()

        # Retrieve with category eagerly loaded.
        created_transaction = (
            transaction_repository.get_transaction_by_id(
                db=db,
                transaction_id=transaction.id,
                user_id=user_id,
            )
        )

        return created_transaction

    except IntegrityError:
        db.rollback()
        raise InvalidTransactionDataError(
            "Unable to create transaction due to invalid data."
        )


def get_transaction(
    db: Session,
    transaction_id: UUID,
    user_id: UUID,
) -> Transaction:

    transaction = transaction_repository.get_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        raise TransactionNotFoundError(
            "Transaction not found."
        )

    return transaction


def get_transactions(
    db: Session,
    user_id: UUID,
    transaction_type: TransactionType | None = None,
    category_id: UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "transaction_date",
    sort_order: str = "desc",
) -> dict:

    # Validate date range.
    if start_date and end_date and start_date > end_date:
        raise InvalidTransactionDataError(
            "Start date cannot be later than end date."
        )

    # Validate pagination.
    if page < 1:
        raise InvalidTransactionDataError(
            "Page must be greater than or equal to 1."
        )

    if page_size < 1 or page_size > MAX_PAGE_SIZE:
        raise InvalidTransactionDataError(
            f"Page size must be between 1 and {MAX_PAGE_SIZE}."
        )

    # Validate sorting.
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise InvalidTransactionDataError(
            "Invalid sorting field."
        )

    if sort_order not in ALLOWED_SORT_ORDERS:
        raise InvalidTransactionDataError(
            "Sort order must be either 'asc' or 'desc'."
        )

    # If a category filter is provided, verify ownership.
    if category_id is not None:
        category = category_repository.get_category_by_id(
            db=db,
            category_id=category_id,
            user_id=user_id,
        )

        if category is None:
            raise TransactionCategoryNotFoundError(
                "Category not found."
            )

        # If type filter is also provided, ensure it matches.
        if transaction_type is not None and category.type != transaction_type:
            raise TransactionCategoryTypeMismatchError(
                "Selected category does not match the transaction type."
            )

    transactions, total = transaction_repository.get_all_transactions(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    total_pages = ceil(total / page_size) if total else 0

    return {
        "items": transactions,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def update_transaction(
    db: Session,
    transaction_id: UUID,
    user_id: UUID,
    update_data: dict,
) -> Transaction:

    # 1. Retrieve transaction and verify ownership.
    transaction = transaction_repository.get_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        raise TransactionNotFoundError(
            "Transaction not found."
        )

    if not update_data:
        raise InvalidTransactionDataError(
            "At least one field must be provided for update."
        )

    # 2. Validate required fields if supplied.
    if "title" in update_data:
        title = update_data["title"]

        if title is None:
            raise InvalidTransactionDataError(
                "Transaction title cannot be null."
            )

        title = title.strip()

        if len(title) < 2:
            raise InvalidTransactionDataError(
                "Transaction title must contain at least 2 characters."
            )

        update_data["title"] = title

    if "amount" in update_data:
        amount = update_data["amount"]

        if amount is None or amount <= 0:
            raise InvalidTransactionDataError(
                "Transaction amount must be greater than zero."
            )

    if "transaction_date" in update_data:
        if update_data["transaction_date"] is None:
            raise InvalidTransactionDataError(
                "Transaction date cannot be null."
            )

    # 3. Validate category if it is being changed.
    if "category_id" in update_data:
        category_id = update_data["category_id"]

        if category_id is None:
            raise InvalidTransactionDataError(
                "Category cannot be null."
            )

        category = category_repository.get_category_by_id(
            db=db,
            category_id=category_id,
            user_id=user_id,
        )

        if category is None:
            raise TransactionCategoryNotFoundError(
                "Category not found."
            )

        if category.type != transaction.type:
            raise TransactionCategoryTypeMismatchError(
                "Transaction type must match the category type."
            )

    # 4. Normalize description.
    if "description" in update_data:
        description = update_data["description"]

        update_data["description"] = (
            description.strip() if description else None
        )

    try:
        transaction_repository.update_transaction(
            db=db,
            transaction=transaction,
            update_data=update_data,
        )

        db.commit()

        return transaction_repository.get_transaction_by_id(
            db=db,
            transaction_id=transaction_id,
            user_id=user_id,
        )

    except IntegrityError:
        db.rollback()
        raise InvalidTransactionDataError(
            "Unable to update transaction due to invalid data."
        )


def delete_transaction(
    db: Session,
    transaction_id: UUID,
    user_id: UUID,
) -> None:

    transaction = transaction_repository.get_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        raise TransactionNotFoundError(
            "Transaction not found."
        )

    transaction_repository.delete_transaction(
        db=db,
        transaction=transaction,
    )

    db.commit()



def get_transaction_totals(
    db: Session,
    user_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict:

    if start_date and end_date and start_date > end_date:
        raise InvalidTransactionDataError(
            "Start date cannot be later than end date."
        )

    return transaction_repository.get_transaction_totals(
        db=db,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )

