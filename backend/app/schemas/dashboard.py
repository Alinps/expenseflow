from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DashboardPeriod(BaseModel):
    start_date: date
    end_date: date


class DashboardOverviewResponse(BaseModel):
    period: DashboardPeriod

    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    overall_balance: Decimal

    model_config = ConfigDict(from_attributes=True)