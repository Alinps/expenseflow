from datetime import date
from decimal import Decimal
from math import ceil
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.enums.savings_contribution_type import SavingsContributionType
from app.models.savings_contribution import SavingsContribution
from app.repositories import (
    savings_goal_repository,
    savings_contribution_repository,
)


class SavingsContributionGoalNotFoundError(Exception):
    pass


class InsufficientSavingsError(Exception):
    pass


class InvalidSavingsContributionError(Exception):
    pass



def create_contribution(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
    amount: Decimal,
    contribution_type: SavingsContributionType,
    description: str | None,
    contribution_date: date,
) -> SavingsContribution:

    # 1. Validate amount.
    if amount <= 0:
        raise InvalidSavingsContributionError(
            "Contribution amount must be greater than zero."
        )

    # 2. Lock the savings goal and verify ownership.
    goal = savings_goal_repository.get_savings_goal_for_update(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if goal is None:
        raise SavingsContributionGoalNotFoundError(
            "Savings goal not found."
        )

    current_amount = Decimal(str(goal.current_amount))
    amount = Decimal(str(amount))

    # 3. Calculate the new balance.
    if contribution_type == SavingsContributionType.CONTRIBUTION:

        new_balance = current_amount + amount

    elif contribution_type == SavingsContributionType.WITHDRAWAL:

        if amount > current_amount:
            db.rollback()

            raise InsufficientSavingsError(
                "Withdrawal amount exceeds available savings."
            )

        new_balance = current_amount - amount

    else:
        db.rollback()

        raise InvalidSavingsContributionError(
            "Invalid contribution type."
        )

    # 4. Create the contribution ledger record.
    contribution = SavingsContribution(
        goal_id=goal_id,
        amount=amount,
        contribution_type=contribution_type,
        description=description.strip() if description else None,
        contribution_date=contribution_date,
    )

    try:
        savings_contribution_repository.create_contribution(
            db=db,
            contribution=contribution,
        )

        # 5. Update the cached balance.
        goal.current_amount = new_balance

        # 6. Commit both operations together.
        db.commit()

        db.refresh(contribution)

        return contribution

    except IntegrityError:
        db.rollback()

        raise InvalidSavingsContributionError(
            "Unable to record savings contribution."
        )





def get_contributions(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 10,
    sort_order: str = "desc",
) -> dict:

    # Verify goal ownership before retrieving history.
    goal = savings_goal_repository.get_savings_goal_by_id(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if goal is None:
        raise SavingsContributionGoalNotFoundError(
            "Savings goal not found."
        )

    # Validate filters.
    if start_date and end_date and start_date > end_date:
        raise InvalidSavingsContributionError(
            "Start date cannot be later than end date."
        )

    if page < 1:
        raise InvalidSavingsContributionError(
            "Page must be greater than or equal to 1."
        )

    if page_size < 1 or page_size > 100:
        raise InvalidSavingsContributionError(
            "Page size must be between 1 and 100."
        )

    if sort_order not in {"asc", "desc"}:
        raise InvalidSavingsContributionError(
            "Sort order must be asc or desc."
        )

    contributions, total = (
        savings_contribution_repository.get_contributions_by_goal(
            db=db,
            goal_id=goal_id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size,
            sort_order=sort_order,
        )
    )

    total_pages = ceil(total / page_size) if total else 0

    return {
        "items": contributions,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }