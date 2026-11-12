from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import uuid4

import pytest

from app.routers import savings_contributions
from app.enums.savings_contribution_type import SavingsContributionType
from app.services.savings_contribution_service import (
    InsufficientSavingsError,
    InvalidSavingsContributionError,
    SavingsContributionGoalNotFoundError,
)


@pytest.fixture
def goal_id():
    return uuid4()


@pytest.fixture
def contribution_id():
    return uuid4()


@pytest.fixture
def contribution_data(goal_id, contribution_id):
    now = datetime.now(timezone.utc)

    return {
        "id": contribution_id,
        "goal_id": goal_id,
        "amount": Decimal("5000.00"),
        "contribution_type": SavingsContributionType.CONTRIBUTION,
        "description": "Monthly savings",
        "contribution_date": date.today(),
        "created_at": now,
        "updated_at": now,
    }


def test_create_contribution(
    client,
    monkeypatch,
    goal_id,
    contribution_data,
):
    def mock_create(*args, **kwargs):
        return contribution_data

    monkeypatch.setattr(
        savings_contributions,
        "create_contribution",
        mock_create,
    )

    response = client.post(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        json={
            "amount": "5000.00",
            "contribution_type": "CONTRIBUTION",
            "description": "Monthly savings",
            "contribution_date": str(date.today()),
        },
    )

    assert response.status_code == 201
    assert response.json()["amount"] == "5000.00"
    assert response.json()["contribution_type"] == "CONTRIBUTION"


def test_create_withdrawal(
    client,
    monkeypatch,
    goal_id,
    contribution_data,
):
    withdrawal_data = {
        **contribution_data,
        "amount": Decimal("2000.00"),
        "contribution_type": SavingsContributionType.WITHDRAWAL,
    }

    def mock_create(*args, **kwargs):
        return withdrawal_data

    monkeypatch.setattr(
        savings_contributions,
        "create_contribution",
        mock_create,
    )

    response = client.post(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        json={
            "amount": "2000.00",
            "contribution_type": "WITHDRAWAL",
            "description": "Emergency expense",
            "contribution_date": str(date.today()),
        },
    )

    assert response.status_code == 201
    assert response.json()["contribution_type"] == "WITHDRAWAL"
    assert response.json()["amount"] == "2000.00"


def test_withdrawal_exceeding_balance_returns_409(
    client,
    monkeypatch,
    goal_id,
):
    def mock_create(*args, **kwargs):
        raise InsufficientSavingsError(
            "Withdrawal exceeds available savings"
        )

    monkeypatch.setattr(
        savings_contributions,
        "create_contribution",
        mock_create,
    )

    response = client.post(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        json={
            "amount": "50000.00",
            "contribution_type": "WITHDRAWAL",
            "contribution_date": str(date.today()),
        },
    )

    assert response.status_code == 409


def test_contribution_for_nonexistent_goal(
    client,
    monkeypatch,
    goal_id,
):
    def mock_create(*args, **kwargs):
        raise SavingsContributionGoalNotFoundError(
            "Savings goal not found"
        )

    monkeypatch.setattr(
        savings_contributions,
        "create_contribution",
        mock_create,
    )

    response = client.post(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        json={
            "amount": "1000.00",
            "contribution_type": "CONTRIBUTION",
            "contribution_date": str(date.today()),
        },
    )

    assert response.status_code == 404


def test_get_contribution_history(
    client,
    monkeypatch,
    goal_id,
    contribution_data,
):
    def mock_get(*args, **kwargs):
        return {
            "items": [contribution_data],
            "total": 1,
            "page": 1,
            "page_size": 10,
            "total_pages": 1,
        }

    monkeypatch.setattr(
        savings_contributions,
        "get_contributions",
        mock_get,
    )

    response = client.get(
        f"/api/v1/savings-goals/{goal_id}/contributions"
    )

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert len(response.json()["items"]) == 1


def test_get_contribution_history_with_pagination(
    client,
    monkeypatch,
    goal_id,
):
    def mock_get(*args, **kwargs):
        return {
            "items": [],
            "total": 25,
            "page": 2,
            "page_size": 10,
            "total_pages": 3,
        }

    monkeypatch.setattr(
        savings_contributions,
        "get_contributions",
        mock_get,
    )

    response = client.get(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        params={
            "page": 2,
            "page_size": 10,
        },
    )

    assert response.status_code == 200
    assert response.json()["page"] == 2
    assert response.json()["page_size"] == 10
    assert response.json()["total_pages"] == 3


def test_contribution_with_zero_amount_returns_422(
    client,
    goal_id,
):
    response = client.post(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        json={
            "amount": "0.00",
            "contribution_type": "CONTRIBUTION",
            "contribution_date": str(date.today()),
        },
    )

    assert response.status_code == 422


def test_contribution_with_invalid_type_returns_422(
    client,
    goal_id,
):
    response = client.post(
        f"/api/v1/savings-goals/{goal_id}/contributions",
        json={
            "amount": "1000.00",
            "contribution_type": "TRANSFER",
            "contribution_date": str(date.today()),
        },
    )

    assert response.status_code == 422