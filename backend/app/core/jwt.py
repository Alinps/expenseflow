import jwt
import uuid

from datetime import datetime, timedelta, timezone

from app.core.config import settings


ALGORITHM = "HS256"

ISSUER = "expenseflow"


def create_access_token(user_id: uuid.UUID) -> str:
    """
    Generate a short-lived access token.
    """

    now = datetime.now(timezone.utc)

    expires_at = now + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": expires_at,
        "iss": ISSUER,
        "jti": str(uuid.uuid4())
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def create_refresh_token(user_id: uuid.UUID) -> tuple[str, datetime]:
    """
    Generate a refresh token and its expiration time.
    """

    now = datetime.now(timezone.utc)

    expires_at = now + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": now,
        "exp": expires_at,
        "iss": ISSUER,
        "jti": str(uuid.uuid4())
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token, expires_at


def decode_token(token: str) -> dict:
    """
    Verify JWT signature and standard claims.
    """

    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[ALGORITHM],
        issuer=ISSUER,
        options={
            "require": [
                "sub",
                "type",
                "iat",
                "exp",
                "iss",
                "jti"
            ]
        }
    )