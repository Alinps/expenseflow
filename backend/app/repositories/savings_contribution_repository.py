from datetime import date
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.savings_contribution import SavingsContribution


def create_contribution(
    db: Session,
    contribution: SavingsContribution,
) -> SavingsContribution:

    db.add(contribution)
    db.flush()

    return contribution


def get_contribution_by_id(
    db: Session,
    contribution_id: UUID,
    goal_id: UUID,
) -> SavingsContribution | None:

    statement = select(SavingsContribution).where(
        SavingsContribution.id == contribution_id,
        SavingsContribution.goal_id == goal_id,
    )

    return db.execute(statement).scalar_one_or_none()


def get_contributions_by_goal(
    db: Session,
    goal_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 10,
    sort_order: str = "desc",
) -> tuple[list[SavingsContribution], int]:

    statement = select(SavingsContribution).where(
        SavingsContribution.goal_id == goal_id
    )

    if start_date is not None:
        statement = statement.where(
            SavingsContribution.contribution_date >= start_date
        )

    if end_date is not None:
        statement = statement.where(
            SavingsContribution.contribution_date <= end_date
        )

    count_statement = (
        select(func.count())
        .select_from(statement.order_by(None).subquery())
    )

    total = db.scalar(count_statement) or 0

    if sort_order == "asc":
        statement = statement.order_by(
            SavingsContribution.contribution_date.asc(),
            SavingsContribution.created_at.asc(),
        )
    else:
        statement = statement.order_by(
            SavingsContribution.contribution_date.desc(),
            SavingsContribution.created_at.desc(),
        )

    statement = statement.offset(
        (page - 1) * page_size
    ).limit(page_size)

    contributions = (
        db.execute(statement)
        .scalars()
        .all()
    )

    return contributions, total