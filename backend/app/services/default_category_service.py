from sqlalchemy.orm import Session

from app.models.category import Category

from app.enums.transaction_type import TransactionType


DEFAULT_CATEGORIES = {

    TransactionType.EXPENSE: [
        "Food",
        "Rent",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Electricity",
        "Healthcare",
        "Education"
    ],

    TransactionType.INCOME: [
        "Salary",
        "Freelancing",
        "Business",
        "Investments",
        "Other Income"
    ]
}


def create_default_categories(
    db: Session,
    user_id
) -> None:

    categories = []

    for category_type, names in DEFAULT_CATEGORIES.items():

        for name in names:

            category = Category(
                user_id=user_id,
                name=name,
                type=category_type
            )

            categories.append(category)

    db.add_all(categories)