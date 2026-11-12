from app.database.base import Base
from app.models import (
    User,
    Category,
    Transaction,
    Budget,
    SavingsGoal
)


def test_all_models_registered():

    expected_tables = {
        "users",
        "categories",
        "transactions",
        "budgets",
        "savings_goals"
    }

    actual_tables = set(Base.metadata.tables.keys())

    assert expected_tables.issubset(actual_tables)


def test_user_has_relationships():

    assert hasattr(User, "categories")
    assert hasattr(User, "transactions")
    assert hasattr(User, "budgets")
    assert hasattr(User, "savings_goals")


def test_transaction_has_relationships():

    assert hasattr(Transaction, "user")
    assert hasattr(Transaction, "category")