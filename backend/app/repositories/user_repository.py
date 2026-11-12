import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session,email: str) -> User | None:

    statement = select(User).where(User.email == email)

    return db.scalar(statement)


def get_user_by_id(db: Session,user_id: uuid.UUID) -> User | None:

    statement = select(User).where(User.id == user_id)

    return db.scalar(statement)


def create_user(db: Session, name: str,email: str,password_hash: str) -> User:

    user = User(name=name,email=email,password_hash=password_hash)

    db.add(user)
    db.flush()

    return user