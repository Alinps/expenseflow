from sqlalchemy import (
    String,
    ForeignKey,
    Enum,
    UniqueConstraint
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.enums.transaction_type import TransactionType
import uuid

class Category(BaseModel):

    __tablename__ = "categories"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "name",
            "type",
            name="uq_category_user_name_type"
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
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

    # Relationships

    user = relationship(
        "User",
        back_populates="categories"
    )

    transactions = relationship(
        "Transaction",
        back_populates="category"
    )

    budgets = relationship(
        "Budget",
        back_populates="category"
    )