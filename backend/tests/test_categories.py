import uuid

from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.dependencies.auth import get_current_user
from app.database.connection import get_db

from app.models.user import User
from app.models.category import Category

from app.enums.transaction_type import TransactionType


client = TestClient(app)


def override_get_current_user():

    user = User(
        name="Test User",
        email="test@example.com",
        password_hash="test-hash"
    )

    user.id = uuid.uuid4()

    return user


def override_get_db():

    yield None


app.dependency_overrides[get_current_user] = (
    override_get_current_user
)

app.dependency_overrides[get_db] = override_get_db


def test_create_category():

    category = Category(
        user_id=uuid.uuid4(),
        name="Food",
        type=TransactionType.EXPENSE
    )

    category.id = uuid.uuid4()
    category.created_at = datetime.now(timezone.utc)

    with patch(
        "app.routers.categories.category_service.create_category",
        return_value=category
    ):

        response = client.post(
            "/api/v1/categories",
            json={
                "name": "Food",
                "type": "EXPENSE"
            }
        )

    assert response.status_code == 201

    assert response.json()["name"] == "Food"

    assert response.json()["type"] == "EXPENSE"


def test_create_category_invalid_name():

    response = client.post(
        "/api/v1/categories",
        json={
            "name": "F",
            "type": "EXPENSE"
        }
    )

    assert response.status_code == 422


def test_create_category_invalid_type():

    response = client.post(
        "/api/v1/categories",
        json={
            "name": "Food",
            "type": "INVALID"
        }
    )

    assert response.status_code == 422