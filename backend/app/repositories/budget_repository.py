from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.enums.transaction_type import TransactionType


def create_budget(
    db: Session,
    budget: Budget,
) -> Budget:

    db.add(budget)
    db.flush()

    return budget


def get_budget_by_id(
    db: Session,
    budget_id: UUID,
    user_id: UUID,
) -> Budget | None:

    statement = (
        select(Budget)
        .options(joinedload(Budget.category))
        .where(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
    )

    return db.execute(statement).unique().scalar_one_or_none()


def get_budget_by_category_period(
    db: Session,
    user_id: UUID,
    category_id: UUID,
    month: int,
    year: int,
) -> Budget | None:

    statement = (
        select(Budget)
        .where(
            Budget.user_id == user_id,
            Budget.category_id == category_id,
            Budget.month == month,
            Budget.year == year,
        )
    )

    return db.execute(statement).scalar_one_or_none()


def get_budgets_by_period(
    db: Session,
    user_id: UUID,
    month: int,
    year: int,
) -> list[Budget]:

    statement = (
        select(Budget)
        .options(joinedload(Budget.category))
        .where(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .order_by(Budget.category_id)
    )

    return db.execute(statement).unique().scalars().all()


def update_budget(
    db: Session,
    budget: Budget,
    monthly_limit: Decimal,
) -> Budget:

    budget.monthly_limit = monthly_limit

    db.flush()

    return budget


def delete_budget(
    db: Session,
    budget: Budget,
) -> None:

    db.delete(budget)
    db.flush()


def get_spending_by_category(
    db: Session,
    user_id: UUID,
    month: int,
    year: int,
) -> dict[UUID, Decimal]:

    start_date = date(year, month, 1)

    if month == 12:
        next_month_start = date(year + 1, 1, 1)
    else:
        next_month_start = date(year, month + 1, 1)

    statement = (
        select(
            Transaction.category_id,
            func.coalesce(
                func.sum(Transaction.amount),
                0,
            ).label("total_spending"),
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date < next_month_start,
        )
        .group_by(Transaction.category_id)
    )

    results = db.execute(statement).all()

    return {
        category_id: Decimal(str(total_spending))
        for category_id, total_spending in results
    }