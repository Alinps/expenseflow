import uuid

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken

from sqlalchemy import select


def create_refresh_token(
    db: Session,user_id: uuid.UUID,
    token_hash: str,
    expires_at: datetime) -> RefreshToken:

    refresh_token = RefreshToken(user_id=user_id,token_hash=token_hash,expires_at=expires_at)

    db.add(refresh_token)
    db.flush()

    return refresh_token


# def get_active_refresh_token(db: Session,token_hash: str) -> RefreshToken | None:

#     now = datetime.now(timezone.utc)

#     statement = select(RefreshToken).where(
#         RefreshToken.token_hash == token_hash,
#         RefreshToken.revoked_at.is_(None),
#         RefreshToken.expires_at > now
#     )

#     return db.scalar(statement)





def get_active_refresh_token(
    db: Session,
    token_hash: str
) -> RefreshToken | None:

    now = datetime.now(timezone.utc)

    statement = (
        select(RefreshToken)
        .where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now
        )
        .with_for_update()
    )

    return db.scalar(statement)


def revoke_refresh_token(refresh_token: RefreshToken) -> None:

    refresh_token.revoked_at = datetime.now(timezone.utc)