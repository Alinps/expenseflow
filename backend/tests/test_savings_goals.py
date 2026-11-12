from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

import pytest

from app.routers import savings_goals
from app.services.savings_goal_service import (
    InvalidSavingsGoalDataError,
    SavingsGoalHasContributionsError,
    SavingsGoalNotFoundError,
)


@pytest.fixture
def goal_id():
    return uuid4()


@pytest.fixture
def goal_data(goal_id):
    now = datetime.now(timezone.utc)

    return {
        "id": goal_id,
        "goal_name": "Emergency Fund",
        "target_amount": Decimal("100000.00"),
        "current_amount": Decimal("25000.00"),
        "target_date": None,
        "created_at": now,
        "updated_at": now,
        "remaining_amount": Decimal("75000.00"),
        "progress_percentage": Decimal("25.00"),
        "is_completed": False,
    }


def test_create_savings_goal(client, monkeypatch, goal_data):
    def mock_create(*args, **kwargs):
        return goal_data

    monkeypatch.setattr(
        savings_goals,
        "create_savings_goal",
        mock_create,
    )

    response = client.post(
        "/api/v1/savings-goals",
        json={
            "goal_name": "Emergency Fund",
            "target_amount": "100000.00",
        },
    )

    assert response.status_code == 201
    assert response.json()["goal_name"] == "Emergency Fund"
    assert response.json()["target_amount"] == "100000.00"
    assert response.json()["current_amount"] == "25000.00"


def test_get_all_savings_goals(client, monkeypatch, goal_data):
    def mock_get_all(*args, **kwargs):
        return {
            "items": [goal_data],
            "total": 1,
        }

    monkeypatch.setattr(
        savings_goals,
        "get_savings_goals",
        mock_get_all,
    )

    response = client.get("/api/v1/savings-goals")

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert len(response.json()["items"]) == 1


def test_get_savings_goal(client, monkeypatch, goal_data, goal_id):
    def mock_get(*args, **kwargs):
        return goal_data

    monkeypatch.setattr(
        savings_goals,
        "get_savings_goal",
        mock_get,
    )

    response = client.get(f"/api/v1/savings-goals/{goal_id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(goal_id)


def test_get_nonexistent_savings_goal(client, monkeypatch, goal_id):
    def mock_get(*args, **kwargs):
        raise SavingsGoalNotFoundError("Savings goal not found")

    monkeypatch.setattr(
        savings_goals,
        "get_savings_goal",
        mock_get,
    )

    response = client.get(f"/api/v1/savings-goals/{goal_id}")

    assert response.status_code == 404


def test_update_savings_goal(client, monkeypatch, goal_data, goal_id):
    updated_data = {
        **goal_data,
        "target_amount": Decimal("150000.00"),
        "remaining_amount": Decimal("125000.00"),
    }

    def mock_update(*args, **kwargs):
        return updated_data

    monkeypatch.setattr(
        savings_goals,
        "update_savings_goal",
        mock_update,
    )

    response = client.put(
        f"/api/v1/savings-goals/{goal_id}",
        json={"target_amount": "150000.00"},
    )

    assert response.status_code == 200
    assert response.json()["target_amount"] == "150000.00"


def test_update_goal_with_invalid_data(client, monkeypatch, goal_id):
    def mock_update(*args, **kwargs):
        raise InvalidSavingsGoalDataError(
            "Target amount cannot be lower than current savings"
        )

    monkeypatch.setattr(
        savings_goals,
        "update_savings_goal",
        mock_update,
    )

    response = client.put(
        f"/api/v1/savings-goals/{goal_id}",
        json={"target_amount": "100.00"},
    )

    assert response.status_code == 422


def test_delete_savings_goal(client, monkeypatch, goal_id):
    def mock_delete(*args, **kwargs):
        return None

    monkeypatch.setattr(
        savings_goals,
        "delete_savings_goal",
        mock_delete,
    )

    response = client.delete(
        f"/api/v1/savings-goals/{goal_id}"
    )

    assert response.status_code == 204


def test_cannot_delete_goal_with_contribution_history(
    client,
    monkeypatch,
    goal_id,
):
    def mock_delete(*args, **kwargs):
        raise SavingsGoalHasContributionsError(
            "Cannot delete a goal with contribution history"
        )

    monkeypatch.setattr(
        savings_goals,
        "delete_savings_goal",
        mock_delete,
    )

    response = client.delete(
        f"/api/v1/savings-goals/{goal_id}"
    )

    assert response.status_code == 409


def test_create_goal_with_invalid_amount(client):
    response = client.post(
        "/api/v1/savings-goals",
        json={
            "goal_name": "Emergency Fund",
            "target_amount": "-1000.00",
        },
    )

    assert response.status_code == 422