from decimal import Decimal
from datetime import date

from sqlalchemy import (
    String,
    Text,
    ForeignKey,
    Enum,
    Numeric,
    Date,
    CheckConstraint
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.enums.transaction_type import TransactionType

import uuid


class Transaction(BaseModel):

    __tablename__ = "transactions"

    __table_args__ = (
        CheckConstraint(
            "amount > 0",
            name="ck_transaction_amount_positive"
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    type: Mapped[TransactionType] = mapped_column(
        Enum(
            TransactionType,
            name="transaction_type",
            values_callable=lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    transaction_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True
    )

    # Relationships

    user = relationship(
        "User",
        back_populates="transactions"
    )

    category = relationship(
        "Category",
        back_populates="transactions"
    )