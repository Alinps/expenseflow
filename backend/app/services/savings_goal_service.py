from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.savings_goal import SavingsGoal
from app.repositories import savings_goal_repository


class SavingsGoalNotFoundError(Exception):
    pass


class InvalidSavingsGoalDataError(Exception):
    pass


class SavingsGoalHasContributionsError(Exception):
    pass


def calculate_savings_goal_details(
    goal: SavingsGoal,
) -> dict:

    target_amount = Decimal(str(goal.target_amount))
    current_amount = Decimal(str(goal.current_amount))

    remaining_amount = max(
        target_amount - current_amount,
        Decimal("0.00"),
    )

    if target_amount > 0:
        progress_percentage = (
            current_amount / target_amount * Decimal("100")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
    else:
        progress_percentage = Decimal("0.00")

    return {
        "id": goal.id,
        "goal_name": goal.goal_name,
        "target_amount": target_amount,
        "current_amount": current_amount,
        "target_date": goal.target_date,
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
        "remaining_amount": remaining_amount,
        "progress_percentage": progress_percentage,
        "is_completed": current_amount >= target_amount,
    }




def create_savings_goal(
    db: Session,
    user_id: UUID,
    goal_name: str,
    target_amount: Decimal,
    target_date,
) -> dict:

    goal_name = goal_name.strip()

    if len(goal_name) < 2:
        raise InvalidSavingsGoalDataError(
            "Goal name must contain at least 2 characters."
        )

    if target_amount <= 0:
        raise InvalidSavingsGoalDataError(
            "Target amount must be greater than zero."
        )

    goal = SavingsGoal(
        user_id=user_id,
        goal_name=goal_name,
        target_amount=target_amount,
        current_amount=Decimal("0.00"),
        target_date=target_date,
    )

    try:
        savings_goal_repository.create_savings_goal(
            db=db,
            goal=goal,
        )

        db.commit()
        db.refresh(goal)

        return calculate_savings_goal_details(goal)

    except IntegrityError:
        db.rollback()

        raise InvalidSavingsGoalDataError(
            "Unable to create savings goal."
        )





def get_savings_goal(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
) -> dict:

    goal = savings_goal_repository.get_savings_goal_by_id(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if goal is None:
        raise SavingsGoalNotFoundError(
            "Savings goal not found."
        )

    return calculate_savings_goal_details(goal)




def get_savings_goals(
    db: Session,
    user_id: UUID,
) -> dict:

    goals = savings_goal_repository.get_all_savings_goals(
        db=db,
        user_id=user_id,
    )

    items = [
        calculate_savings_goal_details(goal)
        for goal in goals
    ]

    return {
        "items": items,
        "total": len(items),
    }






def update_savings_goal(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
    update_data: dict,
) -> dict:

    goal = savings_goal_repository.get_savings_goal_for_update(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if goal is None:
        raise SavingsGoalNotFoundError(
            "Savings goal not found."
        )

    if not update_data:
        raise InvalidSavingsGoalDataError(
            "At least one field must be provided."
        )

    if "goal_name" in update_data:
        goal_name = update_data["goal_name"]

        if goal_name is None:
            raise InvalidSavingsGoalDataError(
                "Goal name cannot be null."
            )

        goal_name = goal_name.strip()

        if len(goal_name) < 2:
            raise InvalidSavingsGoalDataError(
                "Goal name must contain at least 2 characters."
            )

        update_data["goal_name"] = goal_name

    if "target_amount" in update_data:
        target_amount = update_data["target_amount"]

        if target_amount is None or target_amount <= 0:
            raise InvalidSavingsGoalDataError(
                "Target amount must be greater than zero."
            )

        if target_amount < goal.current_amount:
            raise InvalidSavingsGoalDataError(
                "Target amount cannot be less than current savings."
            )

    try:
        savings_goal_repository.update_savings_goal(
            db=db,
            goal=goal,
            update_data=update_data,
        )

        db.commit()
        db.refresh(goal)

        return calculate_savings_goal_details(goal)

    except IntegrityError:
        db.rollback()

        raise InvalidSavingsGoalDataError(
            "Unable to update savings goal."
        )



def delete_savings_goal(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
) -> None:

    goal = savings_goal_repository.get_savings_goal_for_update(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if goal is None:
        raise SavingsGoalNotFoundError(
            "Savings goal not found."
        )

    if savings_goal_repository.has_contributions(
        db=db,
        goal_id=goal_id,
    ):
        raise SavingsGoalHasContributionsError(
            "Cannot delete a savings goal with contribution history."
        )

    if goal.current_amount != Decimal("0.00"):
        raise InvalidSavingsGoalDataError(
            "Cannot delete a goal with a non-zero savings balance."
        )

    savings_goal_repository.delete_savings_goal(
        db=db,
        goal=goal,
    )

    db.commit()

