from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.services.savings_goal_service import (
    calculate_savings_goal_details,
    InvalidSavingsGoalDataError,
)


def test_calculate_savings_progress():

    goal = SimpleNamespace(
        id="goal-123",
        goal_name="Buy a Laptop",
        target_amount=Decimal("80000.00"),
        current_amount=Decimal("25000.00"),
        target_date=None,
        created_at=None,
        updated_at=None,
    )

    result = calculate_savings_goal_details(goal)

    assert result["remaining_amount"] == Decimal("55000.00")
    assert result["progress_percentage"] == Decimal("31.25")
    assert result["is_completed"] is False


def test_calculate_completed_goal():

    goal = SimpleNamespace(
        id="goal-123",
        goal_name="Buy a Laptop",
        target_amount=Decimal("80000.00"),
        current_amount=Decimal("80000.00"),
        target_date=None,
        created_at=None,
        updated_at=None,
    )

    result = calculate_savings_goal_details(goal)

    assert result["remaining_amount"] == Decimal("0.00")
    assert result["progress_percentage"] == Decimal("100.00")
    assert result["is_completed"] is True


def test_calculate_progress_above_target():

    goal = SimpleNamespace(
        id="goal-123",
        goal_name="Buy a Laptop",
        target_amount=Decimal("80000.00"),
        current_amount=Decimal("85000.00"),
        target_date=None,
        created_at=None,
        updated_at=None,
    )

    result = calculate_savings_goal_details(goal)

    assert result["remaining_amount"] == Decimal("0.00")
    assert result["progress_percentage"] == Decimal("106.25")
    assert result["is_completed"] is True