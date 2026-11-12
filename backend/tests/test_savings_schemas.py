from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.savings_goal import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
)

from app.schemas.savings_contribution import (
    SavingsContributionCreate,
)

from app.enums.savings_contribution_type import (
    SavingsContributionType,
)


def test_create_savings_goal():

    data = SavingsGoalCreate(
        goal_name="Buy a Laptop",
        target_amount=Decimal("80000.00"),
        target_date=date(2027, 6, 30),
    )

    assert data.goal_name == "Buy a Laptop"
    assert data.target_amount == Decimal("80000.00")


def test_savings_goal_rejects_zero_target():

    with pytest.raises(ValidationError):

        SavingsGoalCreate(
            goal_name="Buy a Laptop",
            target_amount=Decimal("0"),
        )


def test_savings_goal_update():

    data = SavingsGoalUpdate(
        target_amount=Decimal("100000.00"),
    )

    assert data.target_amount == Decimal("100000.00")
    assert data.goal_name is None


def test_create_savings_contribution():

    data = SavingsContributionCreate(
        amount=Decimal("10000.00"),
        contribution_type=SavingsContributionType.CONTRIBUTION,
        description="Monthly savings",
        contribution_date=date(2026, 11, 13),
    )

    assert data.amount == Decimal("10000.00")
    assert data.contribution_type == SavingsContributionType.CONTRIBUTION


def test_create_savings_withdrawal():

    data = SavingsContributionCreate(
        amount=Decimal("2000.00"),
        contribution_type=SavingsContributionType.WITHDRAWAL,
        contribution_date=date(2026, 11, 14),
    )

    assert data.contribution_type == SavingsContributionType.WITHDRAWAL


def test_reject_negative_contribution():

    with pytest.raises(ValidationError):

        SavingsContributionCreate(
            amount=Decimal("-1000.00"),
            contribution_type=SavingsContributionType.CONTRIBUTION,
            contribution_date=date(2026, 11, 13),
        )


def test_reject_direct_current_amount():

    with pytest.raises(ValidationError):

        SavingsGoalCreate(
            goal_name="Buy a Laptop",
            target_amount=Decimal("80000.00"),
            current_amount=Decimal("50000.00"),
        )