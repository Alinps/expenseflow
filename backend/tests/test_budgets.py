from datetime import datetime, timezone
from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.services import budget_service


@pytest.fixture
def user_id():
    return uuid4()


@pytest.fixture
def category_id():
    return uuid4()


@pytest.fixture
def budget_id():
    return uuid4()


@pytest.fixture
def fake_user(user_id):
    return SimpleNamespace(
        id=user_id,
        email="test@example.com",
        is_active=True,
    )


@pytest.fixture
def fake_budget_response(
    budget_id,
    category_id,
):
    now = datetime.now(timezone.utc)

    return {
        "id": budget_id,
        "category": {
            "id": category_id,
            "name": "Food",
        },
        "monthly_limit": Decimal("8000.00"),
        "month": 11,
        "year": 2026,
        "actual_spending": Decimal("5500.00"),
        "remaining_budget": Decimal("2500.00"),
        "utilization_percentage": Decimal("68.75"),
        "is_exceeded": False,
        "created_at": now,
        "updated_at": now,
    }


@pytest.fixture
def client(fake_user):
    original_overrides = app.dependency_overrides.copy()

    def override_get_db():
        yield object()

    def override_get_current_user():
        return fake_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = (
        override_get_current_user
    )

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    app.dependency_overrides.update(original_overrides)


def test_create_budget(
    client,
    monkeypatch,
    user_id,
    category_id,
    fake_budget_response,
):
    def mock_create_budget(**kwargs):
        assert kwargs["user_id"] == user_id
        assert kwargs["category_id"] == category_id
        assert kwargs["monthly_limit"] == Decimal("8000.00")
        assert kwargs["month"] == 11
        assert kwargs["year"] == 2026

        return fake_budget_response

    monkeypatch.setattr(
        budget_service,
        "create_budget",
        mock_create_budget,
    )

    response = client.post(
        "/api/v1/budgets",
        json={
            "category_id": str(category_id),
            "monthly_limit": 8000.00,
            "month": 11,
            "year": 2026,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["monthly_limit"] == "8000.00"
    assert data["actual_spending"] == "5500.00"
    assert data["remaining_budget"] == "2500.00"
    assert data["utilization_percentage"] == "68.75"
    assert data["is_exceeded"] is False



def test_create_budget_with_zero_amount(
    client,
    category_id,
):
    response = client.post(
        "/api/v1/budgets",
        json={
            "category_id": str(category_id),
            "monthly_limit": 0,
            "month": 11,
            "year": 2026,
        },
    )

    assert response.status_code == 422




def test_create_duplicate_budget(
    client,
    monkeypatch,
    category_id,
):
    def mock_create_budget(**kwargs):
        raise budget_service.DuplicateBudgetError(
            "A budget already exists for this category and period."
        )

    monkeypatch.setattr(
        budget_service,
        "create_budget",
        mock_create_budget,
    )

    response = client.post(
        "/api/v1/budgets",
        json={
            "category_id": str(category_id),
            "monthly_limit": 8000.00,
            "month": 11,
            "year": 2026,
        },
    )

    assert response.status_code == 409




def test_create_budget_for_income_category(
    client,
    monkeypatch,
    category_id,
):
    def mock_create_budget(**kwargs):
        raise budget_service.InvalidBudgetCategoryError(
            "Budgets can only be created for expense categories."
        )

    monkeypatch.setattr(
        budget_service,
        "create_budget",
        mock_create_budget,
    )

    response = client.post(
        "/api/v1/budgets",
        json={
            "category_id": str(category_id),
            "monthly_limit": 8000.00,
            "month": 11,
            "year": 2026,
        },
    )

    assert response.status_code == 422




def test_get_budgets(
    client,
    monkeypatch,
    fake_budget_response,
):
    def mock_get_budgets(**kwargs):
        assert kwargs["month"] == 11
        assert kwargs["year"] == 2026

        return {
            "items": [fake_budget_response],
            "total": 1,
            "month": 11,
            "year": 2026,
        }

    monkeypatch.setattr(
        budget_service,
        "get_budgets",
        mock_get_budgets,
    )

    response = client.get(
        "/api/v1/budgets",
        params={
            "month": 11,
            "year": 2026,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert data["month"] == 11
    assert data["year"] == 2026
    assert len(data["items"]) == 1
    assert data["items"][0]["category"]["name"] == "Food"



def test_get_budget(
    client,
    monkeypatch,
    user_id,
    budget_id,
    fake_budget_response,
):
    def mock_get_budget(**kwargs):
        assert kwargs["budget_id"] == budget_id
        assert kwargs["user_id"] == user_id

        return fake_budget_response

    monkeypatch.setattr(
        budget_service,
        "get_budget",
        mock_get_budget,
    )

    response = client.get(
        f"/api/v1/budgets/{budget_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == str(budget_id)





def test_get_budget_not_found(
    client,
    monkeypatch,
    budget_id,
):
    def mock_get_budget(**kwargs):
        raise budget_service.BudgetNotFoundError(
            "Budget not found."
        )

    monkeypatch.setattr(
        budget_service,
        "get_budget",
        mock_get_budget,
    )

    response = client.get(
        f"/api/v1/budgets/{budget_id}"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Budget not found."





def test_update_budget(
    client,
    monkeypatch,
    budget_id,
    fake_budget_response,
):
    updated_response = {
        **fake_budget_response,
        "monthly_limit": Decimal("10000.00"),
        "remaining_budget": Decimal("4500.00"),
        "utilization_percentage": Decimal("55.00"),
    }

    def mock_update_budget(**kwargs):
        assert kwargs["budget_id"] == budget_id
        assert kwargs["monthly_limit"] == Decimal("10000.00")

        return updated_response

    monkeypatch.setattr(
        budget_service,
        "update_budget",
        mock_update_budget,
    )

    response = client.put(
        f"/api/v1/budgets/{budget_id}",
        json={
            "monthly_limit": 10000.00,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["monthly_limit"] == "10000.00"
    assert data["remaining_budget"] == "4500.00"
    assert data["utilization_percentage"] == "55.00"





def test_delete_budget(
    client,
    monkeypatch,
    budget_id,
):
    def mock_delete_budget(**kwargs):
        assert kwargs["budget_id"] == budget_id

    monkeypatch.setattr(
        budget_service,
        "delete_budget",
        mock_delete_budget,
    )

    response = client.delete(
        f"/api/v1/budgets/{budget_id}"
    )

    assert response.status_code == 204
    assert response.content == b""