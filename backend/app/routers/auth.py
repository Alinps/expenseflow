from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Response,
    Request
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)

from app.services import auth_service

from app.core.config import settings

router = APIRouter(prefix="/api/v1/auth",tags=["Authentication"])


def set_refresh_cookie(response: Response,refresh_token: str):

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="none",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth"
    )


@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister,db: Session = Depends(get_db)):

    try:

        user = auth_service.register_user(
            db=db,
            name=user_data.name,
            email=user_data.email,
            password=user_data.password
        )

        return user

    except auth_service.UserAlreadyExistsError as error:

        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail=str(error))



@router.post("/login",response_model=TokenResponse)
def login(user_data: UserLogin,response: Response,db: Session = Depends(get_db)):

    try:

        access_token, refresh_token, user = (
            auth_service.authenticate_user(
                db=db,
                email=user_data.email,
                password=user_data.password
            )
        )

        set_refresh_cookie(response,refresh_token)

        return TokenResponse(access_token=access_token,user=user)

    except auth_service.InvalidCredentialsError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    except auth_service.InactiveUserError:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive"
        )


@router.post("/refresh",response_model=TokenResponse)
def refresh(request: Request,response: Response,db: Session = Depends(get_db)):

    refresh_token = request.cookies.get("refresh_token")

    try:

        access_token, new_refresh_token, user = (
            auth_service.refresh_access_token(
                db,
                refresh_token or ""
            )
        )

        set_refresh_cookie(
            response,
            new_refresh_token
        )

        return TokenResponse(
            access_token=access_token,
            user=user
        )

    except auth_service.InvalidRefreshTokenError:

        response.delete_cookie(key="refresh_token",path="/api/v1/auth")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )



@router.post("/logout")
def logout(request: Request,response: Response,db: Session = Depends(get_db)):

    refresh_token = request.cookies.get("refresh_token")

    auth_service.logout_user(db,refresh_token)

    response.delete_cookie(key="refresh_token",path="/api/v1/auth")

    return {
        "message": "Logged out successfully"
    }