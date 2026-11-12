import hashlib
import uuid

import jwt

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.security import (
    hash_password,
    verify_password
)

from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token
)

from app.repositories import user_repository
from app.repositories import refresh_token_repository

from app.models.user import User


class UserAlreadyExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InvalidRefreshTokenError(Exception):
    pass


class InactiveUserError(Exception):
    pass


def hash_refresh_token(token: str) -> str:
    """
    Create a SHA-256 hash of the refresh token.
    """

    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def register_user(db: Session,name: str,email: str,password: str) -> User:

    normalized_email = email.strip().lower()

    existing_user = user_repository.get_user_by_email(db,normalized_email)

    if existing_user:
        raise UserAlreadyExistsError("An account with this email already exists")

    hashed_password = hash_password(password)

    try:

        user = user_repository.create_user(
            db=db,
            name=name.strip(),
            email=normalized_email,
            password_hash=hashed_password
        )

        db.commit()
        db.refresh(user)

        return user

    except IntegrityError:

        db.rollback()

        raise UserAlreadyExistsError(
            "An account with this email already exists"
        )


def authenticate_user(db: Session,email: str,password: str) -> tuple[str, str, User]:

    normalized_email = email.strip().lower()

    user = user_repository.get_user_by_email(db,normalized_email)

    if not user:

        raise InvalidCredentialsError("Invalid email or password")

    if not verify_password(password,user.password_hash):

        raise InvalidCredentialsError("Invalid email or password")

    if not user.is_active:

        raise InactiveUserError("Your account is inactive")

    access_token = create_access_token(user.id)

    refresh_token, expires_at = create_refresh_token(user.id)

    token_hash = hash_refresh_token(refresh_token)

    try:

        refresh_token_repository.create_refresh_token(
            db=db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )

        db.commit()

    except Exception:

        db.rollback()
        raise

    return access_token, refresh_token, user


def refresh_access_token(
    db: Session,
    old_refresh_token: str
) -> tuple[str, str, User]:

    try:

        payload = decode_token(old_refresh_token)

        if payload.get("type") != "refresh":
            raise InvalidRefreshTokenError()

        user_id = uuid.UUID(payload["sub"])

    except (
        jwt.InvalidTokenError,
        ValueError,
        KeyError,
        TypeError
    ):

        raise InvalidRefreshTokenError(
            "Invalid or expired refresh token"
        )

    old_token_hash = hash_refresh_token(
        old_refresh_token
    )

    stored_token = (
        refresh_token_repository.get_active_refresh_token(
            db,
            old_token_hash
        )
    )

    if not stored_token or stored_token.user_id != user_id:

        raise InvalidRefreshTokenError(
            "Refresh token has been revoked or is invalid"
        )

    user = user_repository.get_user_by_id(
        db,
        user_id
    )

    if not user or not user.is_active:

        raise InvalidRefreshTokenError(
            "User account is unavailable"
        )

    # Revoke old refresh token.
    refresh_token_repository.revoke_refresh_token(
        stored_token
    )

    # Generate replacement tokens.
    new_access_token = create_access_token(user.id)

    new_refresh_token, expires_at = create_refresh_token(
        user.id
    )

    new_token_hash = hash_refresh_token(
        new_refresh_token
    )

    refresh_token_repository.create_refresh_token(
        db=db,
        user_id=user.id,
        token_hash=new_token_hash,
        expires_at=expires_at
    )

    # Both changes happen in one transaction.
    db.commit()

    return new_access_token, new_refresh_token, user


def logout_user(
    db: Session,
    refresh_token: str | None
) -> None:

    if not refresh_token:
        return

    token_hash = hash_refresh_token(refresh_token)

    stored_token = (
        refresh_token_repository.get_active_refresh_token(
            db,
            token_hash
        )
    )

    if stored_token:

        refresh_token_repository.revoke_refresh_token(stored_token)

        db.commit()