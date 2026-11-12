from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

from app.enums.transaction_type import TransactionType


class CategoryCreate(BaseModel):

    name: str = Field(min_length=2,max_length=100)

    type: TransactionType


class CategoryUpdate(BaseModel):

    name: str = Field(min_length=2,max_length=100)


class CategoryResponse(BaseModel):

    id: UUID

    name: str

    type: TransactionType

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)