from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories import dashboard_repository


class InvalidDashboardPeriodError(Exception):
    pass


def get_dashboard_overview(
    db: Session,
    user_id: UUID,
    start_date: date,
    end_date: date,
):
    if start_date > end_date:
        raise InvalidDashboardPeriodError(
            "Start date cannot be after end date"
        )

    financial_data = dashboard_repository.get_financial_overview(
        db=db,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )

    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },
        **financial_data,
    }