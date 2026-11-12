from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SavingsGoalCreate(BaseModel):

    goal_name: str = Field(
        min_length=2,
        max_length=150,
    )

    target_amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    target_date: date | None = None

    model_config = ConfigDict(extra="forbid")


class SavingsGoalUpdate(BaseModel):

    goal_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    target_amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    target_date: date | None = None

    model_config = ConfigDict(extra="forbid")


class SavingsGoalResponse(BaseModel):

    id: UUID
    goal_name: str
    target_amount: Decimal
    current_amount: Decimal
    target_date: date | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavingsGoalDetailResponse(SavingsGoalResponse):

    remaining_amount: Decimal
    progress_percentage: Decimal
    is_completed: bool


class SavingsGoalListResponse(BaseModel):

    items: list[SavingsGoalDetailResponse]
    total: int