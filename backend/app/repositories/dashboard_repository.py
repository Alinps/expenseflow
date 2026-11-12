from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, func, case, and_
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.enums.transaction_type import TransactionType


def get_financial_overview(
    db: Session,
    user_id: UUID,
    start_date: date,
    end_date: date,
):
    is_income = Transaction.type == TransactionType.INCOME
    is_expense = Transaction.type == TransactionType.EXPENSE

    is_in_period = and_(
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= end_date,
    )

    statement = select(
        # Income within the selected period
        func.coalesce(
            func.sum(
                case(
                    (
                        and_(is_income, is_in_period),
                        Transaction.amount,
                    ),
                    else_=Decimal("0.00"),
                )
            ),
            Decimal("0.00"),
        ).label("total_income"),

        # Expenses within the selected period
        func.coalesce(
            func.sum(
                case(
                    (
                        and_(is_expense, is_in_period),
                        Transaction.amount,
                    ),
                    else_=Decimal("0.00"),
                )
            ),
            Decimal("0.00"),
        ).label("total_expenses"),

        # All-time income
        func.coalesce(
            func.sum(
                case(
                    (is_income, Transaction.amount),
                    else_=Decimal("0.00"),
                )
            ),
            Decimal("0.00"),
        ).label("overall_income"),

        # All-time expenses
        func.coalesce(
            func.sum(
                case(
                    (is_expense, Transaction.amount),
                    else_=Decimal("0.00"),
                )
            ),
            Decimal("0.00"),
        ).label("overall_expenses"),
    ).where(
        Transaction.user_id == user_id
    )

    result = db.execute(statement).one()

    total_income = Decimal(result.total_income or 0)
    total_expenses = Decimal(result.total_expenses or 0)

    overall_income = Decimal(result.overall_income or 0)
    overall_expenses = Decimal(result.overall_expenses or 0)

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": total_income - total_expenses,
        "overall_balance": overall_income - overall_expenses,
    }