from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.routers import auth, users, categories, transactions,budgets, savings_goals, savings_contributions

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"]
)


# Register routers

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(savings_goals.router)
app.include_router(savings_contributions.router)


@app.get("/")
def root():

    return {
        "message": "Welcome to ExpenseFlow API",
        "version": settings.APP_VERSION
    }

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }