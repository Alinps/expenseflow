from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.savings_goal import SavingsGoal

from app.models.savings_contribution import SavingsContribution

def create_savings_goal(
    db: Session,
    goal: SavingsGoal,
) -> SavingsGoal:

    db.add(goal)
    db.flush()

    return goal


def get_savings_goal_by_id(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
) -> SavingsGoal | None:

    statement = select(SavingsGoal).where(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == user_id,
    )

    return db.execute(statement).scalar_one_or_none()



def get_savings_goal_for_update(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
) -> SavingsGoal | None:

    statement = (
        select(SavingsGoal)
        .where(
            SavingsGoal.id == goal_id,
            SavingsGoal.user_id == user_id,
        )
        .with_for_update()
    )

    return db.execute(statement).scalar_one_or_none()


def get_all_savings_goals(
    db: Session,
    user_id: UUID,
) -> list[SavingsGoal]:

    statement = (
        select(SavingsGoal)
        .where(SavingsGoal.user_id == user_id)
        .order_by(SavingsGoal.created_at.desc())
    )

    return db.execute(statement).scalars().all()


def update_savings_goal(
    db: Session,
    goal: SavingsGoal,
    update_data: dict,
) -> SavingsGoal:

    for field, value in update_data.items():
        setattr(goal, field, value)

    db.flush()

    return goal


def delete_savings_goal(
    db: Session,
    goal: SavingsGoal,
) -> None:

    db.delete(goal)
    db.flush()


from sqlalchemy import select


def has_contributions(
    db: Session,
    goal_id: UUID,
) -> bool:

    statement = (
        select(SavingsContribution.id)
        .where(SavingsContribution.goal_id == goal_id)
        .limit(1)
    )

    return db.execute(statement).scalar_one_or_none() is not None