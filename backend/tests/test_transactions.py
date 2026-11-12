from datetime import date, datetime, timezone
from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.services import transaction_service


@pytest.fixture
def user_id():
    return uuid4()


@pytest.fixture
def category_id():
    return uuid4()


@pytest.fixture
def transaction_id():
    return uuid4()


@pytest.fixture
def fake_user(user_id):
    return SimpleNamespace(
        id=user_id,
        email="test@example.com",
        is_active=True,
    )


@pytest.fixture
def fake_transaction(user_id, category_id, transaction_id):
    now = datetime.now(timezone.utc)

    return SimpleNamespace(
        id=transaction_id,
        user_id=user_id,
        category_id=category_id,
        title="Monthly Groceries",
        amount=Decimal("2500.00"),
        type="EXPENSE",
        category=SimpleNamespace(
            id=category_id,
            name="Food",
        ),
        description="Monthly grocery shopping",
        transaction_date=date(2026, 11, 12),
        created_at=now,
        updated_at=now,
    )


@pytest.fixture
def client(fake_user):
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



def test_create_transaction(
    client,
    monkeypatch,
    user_id,
    category_id,
    fake_transaction,
):
    def mock_create_transaction(**kwargs):
        assert kwargs["user_id"] == user_id
        assert kwargs["category_id"] == category_id
        assert kwargs["amount"] == Decimal("2500.00")

        return fake_transaction

    monkeypatch.setattr(
        transaction_service,
        "create_transaction",
        mock_create_transaction,
    )

    response = client.post(
        "/api/v1/transactions",
        json={
            "title": "Monthly Groceries",
            "amount": 2500.00,
            "type": "EXPENSE",
            "category_id": str(category_id),
            "description": "Monthly grocery shopping",
            "transaction_date": "2026-11-12",
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Monthly Groceries"
    assert response.json()["amount"] == "2500.00"
    assert response.json()["category"]["name"] == "Food"



def test_create_transaction_with_negative_amount(client):
    response = client.post(
        "/api/v1/transactions",
        json={
            "title": "Invalid Expense",
            "amount": -100,
            "type": "EXPENSE",
            "category_id": str(uuid4()),
            "description": "Invalid amount",
            "transaction_date": "2026-11-12",
        },
    )

    assert response.status_code == 422




def test_get_transactions(
    client,
    monkeypatch,
    fake_transaction,
):
    def mock_get_transactions(**kwargs):
        return {
            "items": [fake_transaction],
            "total": 1,
            "page": 1,
            "page_size": 10,
            "total_pages": 1,
        }

    monkeypatch.setattr(
        transaction_service,
        "get_transactions",
        mock_get_transactions,
    )

    response = client.get(
        "/api/v1/transactions",
        params={
            "type": "EXPENSE",
            "page": 1,
            "page_size": 10,
            "sort_by": "amount",
            "sort_order": "desc",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert data["page"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["category"]["name"] == "Food"



def test_get_transaction(
    client,
    monkeypatch,
    transaction_id,
    user_id,
    fake_transaction,
):
    def mock_get_transaction(**kwargs):
        assert kwargs["transaction_id"] == transaction_id
        assert kwargs["user_id"] == user_id

        return fake_transaction

    monkeypatch.setattr(
        transaction_service,
        "get_transaction",
        mock_get_transaction,
    )

    response = client.get(
        f"/api/v1/transactions/{transaction_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == str(transaction_id)



def test_get_transaction_not_found(
    client,
    monkeypatch,
    transaction_id,
):
    def mock_get_transaction(**kwargs):
        raise transaction_service.TransactionNotFoundError(
            "Transaction not found."
        )

    monkeypatch.setattr(
        transaction_service,
        "get_transaction",
        mock_get_transaction,
    )

    response = client.get(
        f"/api/v1/transactions/{transaction_id}"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Transaction not found."




def test_update_transaction(
    client,
    monkeypatch,
    transaction_id,
    fake_transaction,
):
    def mock_update_transaction(**kwargs):
        assert kwargs["transaction_id"] == transaction_id
        assert kwargs["update_data"]["amount"] == Decimal("3000.00")

        fake_transaction.amount = Decimal("3000.00")

        return fake_transaction

    monkeypatch.setattr(
        transaction_service,
        "update_transaction",
        mock_update_transaction,
    )

    response = client.put(
        f"/api/v1/transactions/{transaction_id}",
        json={
            "amount": 3000.00,
        },
    )

    assert response.status_code == 200
    assert response.json()["amount"] == "3000.00"




def test_delete_transaction(
    client,
    monkeypatch,
    transaction_id,
):
    def mock_delete_transaction(**kwargs):
        assert kwargs["transaction_id"] == transaction_id
        return None

    monkeypatch.setattr(
        transaction_service,
        "delete_transaction",
        mock_delete_transaction,
    )

    response = client.delete(
        f"/api/v1/transactions/{transaction_id}"
    )

    assert response.status_code == 204
    assert response.content == b""



def test_get_transaction_summary(client, monkeypatch):
    def mock_get_transaction_totals(**kwargs):
        return {
            "total_income": Decimal("45000.00"),
            "total_expenses": Decimal("2500.00"),
            "balance": Decimal("42500.00"),
        }

    monkeypatch.setattr(
        transaction_service,
        "get_transaction_totals",
        mock_get_transaction_totals,
    )

    response = client.get(
        "/api/v1/transactions/summary"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_income"] == "45000.00"
    assert data["total_expenses"] == "2500.00"
    assert data["balance"] == "42500.00"