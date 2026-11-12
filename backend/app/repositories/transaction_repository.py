from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.models.transaction import Transaction
from app.enums.transaction_type import TransactionType

from sqlalchemy import case


def create_transaction(db: Session, transaction: Transaction) -> Transaction:
    db.add(transaction)
    db.flush()

    return transaction


def get_transaction_by_id(
    db: Session,
    transaction_id: UUID,
    user_id: UUID
) -> Transaction | None:

    statement = (
        select(Transaction)
        .options(joinedload(Transaction.category))
        .where(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id
        )
    )

    return db.execute(statement).unique().scalar_one_or_none()


def get_all_transactions(
    db: Session,
    user_id: UUID,
    transaction_type: TransactionType | None = None,
    category_id: UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "transaction_date",
    sort_order: str = "desc"
) -> tuple[list[Transaction], int]:

    statement = (
        select(Transaction)
        .options(joinedload(Transaction.category))
        .where(Transaction.user_id == user_id)
    )

    if transaction_type is not None:
        statement = statement.where(
            Transaction.type == transaction_type
        )

    if category_id is not None:
        statement = statement.where(
            Transaction.category_id == category_id
        )

    if start_date is not None:
        statement = statement.where(
            Transaction.transaction_date >= start_date
        )

    if end_date is not None:
        statement = statement.where(
            Transaction.transaction_date <= end_date
        )

    count_statement = (
        select(func.count())
        .select_from(statement.order_by(None).subquery())
    )

    total = db.scalar(count_statement) or 0

    sort_columns = {
        "transaction_date": Transaction.transaction_date,
        "amount": Transaction.amount,
        "created_at": Transaction.created_at
    }

    sort_column = sort_columns[sort_by]

    if sort_order == "asc":
        statement = statement.order_by(sort_column.asc())
    else:
        statement = statement.order_by(sort_column.desc())

    statement = statement.offset(
        (page - 1) * page_size
    ).limit(page_size)

    transactions = db.execute(statement).unique().scalars().all()

    return transactions, total


def update_transaction(
    db: Session,
    transaction: Transaction,
    update_data: dict
) -> Transaction:

    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.flush()

    return transaction


def delete_transaction(
    db: Session,
    transaction: Transaction
) -> None:

    db.delete(transaction)
    db.flush()




from sqlalchemy import case


def get_transaction_totals(
    db: Session,
    user_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict:

    income_expression = func.coalesce(
        func.sum(
            case(
                (
                    Transaction.type == TransactionType.INCOME,
                    Transaction.amount,
                ),
                else_=0,
            )
        ),
        0,
    )

    expense_expression = func.coalesce(
        func.sum(
            case(
                (
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.amount,
                ),
                else_=0,
            )
        ),
        0,
    )

    statement = select(
        income_expression.label("total_income"),
        expense_expression.label("total_expenses"),
    ).where(Transaction.user_id == user_id)

    if start_date is not None:
        statement = statement.where(
            Transaction.transaction_date >= start_date
        )

    if end_date is not None:
        statement = statement.where(
            Transaction.transaction_date <= end_date
        )

    result = db.execute(statement).one()

    total_income = Decimal(str(result.total_income))
    total_expenses = Decimal(str(result.total_expenses))

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": total_income - total_expenses,
    }