import uuid

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.enums.transaction_type import TransactionType


def create_category(
    db: Session,
    user_id: uuid.UUID,
    name: str,
    category_type: TransactionType
    ) -> Category:

    category = Category(user_id=user_id,name=name,type=category_type)

    db.add(category)
    db.flush()

    return category


def get_category_by_id(
    db: Session,
    category_id: uuid.UUID,
    user_id: uuid.UUID
    ) -> Category | None:

    statement = select(Category).where(
        Category.id == category_id,
        Category.user_id == user_id
        )

    return db.scalar(statement)


def get_category_by_name(
    db: Session,
    user_id: uuid.UUID,
    name: str,
    category_type: TransactionType
) -> Category | None:

    statement = select(Category).where(
        Category.user_id == user_id,
        func.lower(Category.name) == name.lower(),
        Category.type == category_type
    )

    return db.scalar(statement)


def get_all_categories(
    db: Session,
    user_id: uuid.UUID,
    category_type: TransactionType | None = None
) -> list[Category]:

    statement = select(Category).where(
        Category.user_id == user_id
    )

    if category_type:

        statement = statement.where(
            Category.type == category_type
        )

    statement = statement.order_by(
        Category.name.asc()
    )

    return list(db.scalars(statement).all())


def update_category(
    category: Category,
    name: str
) -> Category:

    category.name = name

    return category


def delete_category(
    db: Session,
    category: Category
) -> None:

    db.delete(category)
    db.flush()