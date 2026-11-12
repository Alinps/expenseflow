from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.enums.transaction_type import TransactionType
from app.models.budget import Budget
from app.repositories import budget_repository, category_repository


class BudgetNotFoundError(Exception):
    pass


class BudgetCategoryNotFoundError(Exception):
    pass


class InvalidBudgetCategoryError(Exception):
    pass


class DuplicateBudgetError(Exception):
    pass


class InvalidBudgetDataError(Exception):
    pass


def calculate_budget_details(
    budget: Budget,
    actual_spending: Decimal,
) -> dict:

    monthly_limit = Decimal(str(budget.monthly_limit))
    actual_spending = Decimal(str(actual_spending))

    remaining_budget = monthly_limit - actual_spending

    if monthly_limit > 0:
        utilization_percentage = (
            actual_spending / monthly_limit * Decimal("100")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
    else:
        utilization_percentage = Decimal("0.00")

    return {
        "id": budget.id,
        "category": budget.category,
        "monthly_limit": monthly_limit,
        "month": budget.month,
        "year": budget.year,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
        "actual_spending": actual_spending,
        "remaining_budget": remaining_budget,
        "utilization_percentage": utilization_percentage,
        "is_exceeded": actual_spending > monthly_limit,
    }


def validate_budget_period(month: int, year: int) -> None:

    if month < 1 or month > 12:
        raise InvalidBudgetDataError(
            "Month must be between 1 and 12."
        )

    if year < 2000 or year > 2100:
        raise InvalidBudgetDataError(
            "Year must be between 2000 and 2100."
        )



def create_budget(
    db: Session,
    user_id: UUID,
    category_id: UUID,
    monthly_limit: Decimal,
    month: int,
    year: int,
) -> dict:

    validate_budget_period(month, year)
    # 1. Validate monthly limit.
    if monthly_limit <= 0:
        raise InvalidBudgetDataError(
            "Monthly limit must be greater than zero."
        )

    # 2. Validate category ownership.
    category = category_repository.get_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        raise BudgetCategoryNotFoundError(
            "Category not found."
        )

    # 3. Only expense categories can have budgets.
    if category.type != TransactionType.EXPENSE:
        raise InvalidBudgetCategoryError(
            "Budgets can only be created for expense categories."
        )

    # 4. Check for an existing budget.
    existing_budget = budget_repository.get_budget_by_category_period(
        db=db,
        user_id=user_id,
        category_id=category_id,
        month=month,
        year=year,
    )

    if existing_budget is not None:
        raise DuplicateBudgetError(
            "A budget already exists for this category and period."
        )

    # 5. Create the budget.
    budget = Budget(
        user_id=user_id,
        category_id=category_id,
        monthly_limit=monthly_limit,
        month=month,
        year=year,
    )

    try:
        budget_repository.create_budget(
            db=db,
            budget=budget,
        )

        db.commit()

        # Reload with category relationship.
        created_budget = budget_repository.get_budget_by_id(
            db=db,
            budget_id=budget.id,
            user_id=user_id,
        )

        spending = budget_repository.get_spending_by_category(
            db=db,
            user_id=user_id,
            month=month,
            year=year,
        )

        actual_spending = spending.get(
            category_id,
            Decimal("0.00"),
        )

        return calculate_budget_details(
            budget=created_budget,
            actual_spending=actual_spending,
        )

    except IntegrityError:
        db.rollback()

        raise DuplicateBudgetError(
            "A budget already exists for this category and period."
        )




def get_budget(
    db: Session,
    budget_id: UUID,
    user_id: UUID,
) -> dict:


    budget = budget_repository.get_budget_by_id(
        db=db,
        budget_id=budget_id,
        user_id=user_id,
    )

    if budget is None:
        raise BudgetNotFoundError(
            "Budget not found."
        )

    spending = budget_repository.get_spending_by_category(
        db=db,
        user_id=user_id,
        month=budget.month,
        year=budget.year,
    )

    actual_spending = spending.get(
        budget.category_id,
        Decimal("0.00"),
    )

    return calculate_budget_details(
        budget=budget,
        actual_spending=actual_spending,
    )



def get_budgets(
    db: Session,
    user_id: UUID,
    month: int,
    year: int,
) -> dict:

    validate_budget_period(month, year)
    budgets = budget_repository.get_budgets_by_period(
        db=db,
        user_id=user_id,
        month=month,
        year=year,
    )

    # Retrieve spending for all categories in one query.
    spending = budget_repository.get_spending_by_category(
        db=db,
        user_id=user_id,
        month=month,
        year=year,
    )

    budget_items = []

    for budget in budgets:
        actual_spending = spending.get(
            budget.category_id,
            Decimal("0.00"),
        )

        budget_details = calculate_budget_details(
            budget=budget,
            actual_spending=actual_spending,
        )

        budget_items.append(budget_details)

    return {
        "items": budget_items,
        "total": len(budget_items),
        "month": month,
        "year": year,
    }





def update_budget(
    db: Session,
    budget_id: UUID,
    user_id: UUID,
    monthly_limit: Decimal,
) -> dict:

    if monthly_limit <= 0:
        raise InvalidBudgetDataError(
            "Monthly limit must be greater than zero."
        )

    # 1. Retrieve budget and verify ownership.
    budget = budget_repository.get_budget_by_id(
        db=db,
        budget_id=budget_id,
        user_id=user_id,
    )

    if budget is None:
        raise BudgetNotFoundError(
            "Budget not found."
        )

    try:
        # 2. Update monthly limit.
        budget_repository.update_budget(
            db=db,
            budget=budget,
            monthly_limit=monthly_limit,
        )

        db.commit()

        # 3. Reload updated budget.
        updated_budget = budget_repository.get_budget_by_id(
            db=db,
            budget_id=budget_id,
            user_id=user_id,
        )

        # 4. Calculate current spending.
        spending = budget_repository.get_spending_by_category(
            db=db,
            user_id=user_id,
            month=updated_budget.month,
            year=updated_budget.year,
        )

        actual_spending = spending.get(
            updated_budget.category_id,
            Decimal("0.00"),
        )

        return calculate_budget_details(
            budget=updated_budget,
            actual_spending=actual_spending,
        )

    except IntegrityError:
        db.rollback()

        raise InvalidBudgetDataError(
            "Unable to update budget."
        )



def delete_budget(
    db: Session,
    budget_id: UUID,
    user_id: UUID,
) -> None:

    budget = budget_repository.get_budget_by_id(
        db=db,
        budget_id=budget_id,
        user_id=user_id,
    )

    if budget is None:
        raise BudgetNotFoundError(
            "Budget not found."
        )

    budget_repository.delete_budget(
        db=db,
        budget=budget,
    )

    db.commit()