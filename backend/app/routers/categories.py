import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.dependencies.auth import get_current_user

from app.models.user import User

from app.enums.transaction_type import TransactionType

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse
)

from app.services import category_service


router = APIRouter(prefix="/api/v1/categories",tags=["Categories"])




@router.post("",response_model=CategoryResponse,status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return category_service.create_category(
            db=db,
            user_id=current_user.id,
            name=category_data.name,
            category_type=category_data.type
        )

    except category_service.CategoryAlreadyExistsError as error:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )




@router.get("",response_model=list[CategoryResponse])
def get_categories(
    category_type: TransactionType | None = Query(default=None,alias="type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return category_service.get_categories(
        db=db,
        user_id=current_user.id,
        category_type=category_type
    )




@router.get("/{category_id}",response_model=CategoryResponse)
def get_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return category_service.get_category(
            db=db,
            category_id=category_id,
            user_id=current_user.id
        )

    except category_service.CategoryNotFoundError:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )






@router.put("/{category_id}",response_model=CategoryResponse)
def update_category(
    category_id: uuid.UUID,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return category_service.update_category(
            db=db,
            category_id=category_id,
            user_id=current_user.id,
            name=category_data.name
        )

    except category_service.CategoryNotFoundError:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
            )

    except category_service.CategoryAlreadyExistsError as error:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )





@router.delete("/{category_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        category_service.delete_category(
            db=db,
            category_id=category_id,
            user_id=current_user.id
        )

    except category_service.CategoryNotFoundError:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    except category_service.CategoryInUseError as error:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )