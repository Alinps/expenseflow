from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.savings_contribution_type import (
    SavingsContributionType,
)


class SavingsContributionCreate(BaseModel):

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    contribution_type: SavingsContributionType

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    contribution_date: date

    model_config = ConfigDict(extra="forbid")


class SavingsContributionResponse(BaseModel):

    id: UUID
    goal_id: UUID
    amount: Decimal
    contribution_type: SavingsContributionType
    description: str | None
    contribution_date: date

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavingsContributionListResponse(BaseModel):

    items: list[SavingsContributionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int