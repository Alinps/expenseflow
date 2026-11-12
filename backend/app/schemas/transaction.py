from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.transaction_type import TransactionType


class TransactionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: TransactionType
    category_id: UUID
    description: str | None = Field(default=None, max_length=500)
    transaction_date: date


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2
    )
    category_id: UUID | None = None
    description: str | None = Field(default=None, max_length=500)
    transaction_date: date | None = None


class CategorySummary(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class TransactionResponse(BaseModel):
    id: UUID
    title: str
    amount: Decimal
    type: TransactionType
    category: CategorySummary
    description: str | None
    transaction_date: date
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int