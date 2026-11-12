from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    Date,
    Enum as SQLAlchemyEnum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.enums.savings_contribution_type import SavingsContributionType


class SavingsContribution(BaseModel):

    __tablename__ = "savings_contributions"

    goal_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "savings_goals.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    contribution_type: Mapped[SavingsContributionType] = mapped_column(
        SQLAlchemyEnum(
            SavingsContributionType,
            native_enum=False,
            create_constraint=True,
        ),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    contribution_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    goal = relationship(
        "SavingsGoal",
        back_populates="contributions",
    )

    __table_args__ = (
        CheckConstraint(
            "amount > 0",
            name="ck_savings_contribution_amount_positive",
        ),
    )