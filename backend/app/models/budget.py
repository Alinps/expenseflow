from decimal import Decimal

from sqlalchemy import (
    ForeignKey,
    Numeric,
    Integer,
    CheckConstraint,
    UniqueConstraint
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

import uuid


class Budget(BaseModel):

    __tablename__ = "budgets"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "category_id",
            "month",
            "year",
            name="uq_budget_user_category_period"
        ),
        CheckConstraint(
            "monthly_limit > 0",
            name="ck_budget_limit_positive"
        ),
        CheckConstraint(
            "month >= 1 AND month <= 12",
            name="ck_budget_month_valid"
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False
    )

    monthly_limit: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    month: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    # Relationships

    user = relationship(
        "User",
        back_populates="budgets"
    )

    category = relationship(
        "Category",
        back_populates="budgets"
    )