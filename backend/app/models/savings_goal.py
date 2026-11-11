from decimal import Decimal
from datetime import date

from sqlalchemy import (
    String,
    ForeignKey,
    Numeric,
    Date,
    CheckConstraint
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

import uuid


class SavingsGoal(BaseModel):

    __tablename__ = "savings_goals"

    __table_args__ = (
        CheckConstraint(
            "target_amount > 0",
            name="ck_savings_target_positive"
        ),
        CheckConstraint(
            "current_amount >= 0",
            name="ck_savings_current_nonnegative"
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    goal_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    target_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False
    )

    target_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    # Relationships

    user = relationship(
        "User",
        back_populates="savings_goals"
    )