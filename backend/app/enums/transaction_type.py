from enum import Enum


class TransactionType(str, Enum):

    INCOME = "INCOME"
    EXPENSE = "EXPENSE"