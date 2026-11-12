from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BudgetCreate(BaseModel):
    category_id: UUID
    monthly_limit: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)


class BudgetUpdate(BaseModel):
    monthly_limit: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )


class BudgetCategorySummary(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class BudgetResponse(BaseModel):
    id: UUID
    category: BudgetCategorySummary
    monthly_limit: Decimal
    month: int
    year: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetDetailResponse(BudgetResponse):
    actual_spending: Decimal
    remaining_budget: Decimal
    utilization_percentage: Decimal
    is_exceeded: bool


class BudgetListResponse(BaseModel):
    items: list[BudgetDetailResponse]
    total: int
    month: int
    year: int