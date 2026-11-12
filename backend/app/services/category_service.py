import uuid

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget

from app.enums.transaction_type import TransactionType

from app.repositories import category_repository


class CategoryNotFoundError(Exception):
    pass


class CategoryAlreadyExistsError(Exception):
    pass


class CategoryInUseError(Exception):
    pass


def create_category(
    db: Session,
    user_id: uuid.UUID,
    name: str,
    category_type: TransactionType
) -> Category:

    normalized_name = name.strip()

    if len(normalized_name) < 2:

        raise ValueError(
            "Category name must contain at least 2 characters"
        )

    existing_category = (
        category_repository.get_category_by_name(
            db,
            user_id,
            normalized_name,
            category_type
        )
    )

    if existing_category:

        raise CategoryAlreadyExistsError(
            "A category with this name and type already exists"
        )

    try:

        category = category_repository.create_category(
            db=db,
            user_id=user_id,
            name=normalized_name,
            category_type=category_type
        )

        db.commit()
        db.refresh(category)

        return category

    except IntegrityError:

        db.rollback()

        raise CategoryAlreadyExistsError(
            "A category with this name and type already exists"
        )


def get_category(
    db: Session,
    category_id: uuid.UUID,
    user_id: uuid.UUID
) -> Category:

    category = category_repository.get_category_by_id(
        db,
        category_id,
        user_id
    )

    if not category:

        raise CategoryNotFoundError(
            "Category not found"
        )

    return category


def get_categories(
    db: Session,
    user_id: uuid.UUID,
    category_type: TransactionType | None = None
) -> list[Category]:

    return category_repository.get_all_categories(
        db,
        user_id,
        category_type
    )


def update_category(
    db: Session,
    category_id: uuid.UUID,
    user_id: uuid.UUID,
    name: str
) -> Category:

    category = get_category(
        db,
        category_id,
        user_id
    )

    normalized_name = name.strip()

    if len(normalized_name) < 2:

        raise ValueError(
            "Category name must contain at least 2 characters"
        )

    existing_category = (
        category_repository.get_category_by_name(
            db,
            user_id,
            normalized_name,
            category.type
        )
    )

    if (
        existing_category
        and existing_category.id != category.id
    ):

        raise CategoryAlreadyExistsError(
            "A category with this name already exists"
        )

    try:

        category_repository.update_category(
            category,
            normalized_name
        )

        db.commit()
        db.refresh(category)

        return category

    except IntegrityError:

        db.rollback()

        raise CategoryAlreadyExistsError(
            "A category with this name already exists"
        )


def delete_category(
    db: Session,
    category_id: uuid.UUID,
    user_id: uuid.UUID
) -> None:

    category = get_category(
        db,
        category_id,
        user_id
    )

    # Check whether transactions use this category.

    transaction_statement = select(Transaction.id).where(
        Transaction.category_id == category.id,
        Transaction.user_id == user_id
    ).limit(1)

    has_transactions = (
        db.scalar(transaction_statement) is not None
    )

    # Check whether budgets use this category.

    budget_statement = select(Budget.id).where(
        Budget.category_id == category.id,
        Budget.user_id == user_id
    ).limit(1)

    has_budgets = (
        db.scalar(budget_statement) is not None
    )

    if has_transactions or has_budgets:

        raise CategoryInUseError(
            "Cannot delete a category that has transactions or budgets"
        )

    try:

        category_repository.delete_category(
            db,
            category
        )

        db.commit()

    except IntegrityError:

        db.rollback()

        raise CategoryInUseError(
            "Cannot delete this category because it is being used"
        )