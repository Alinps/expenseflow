from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict
)

import uuid

class UserRegister(BaseModel):

    name: str = Field(min_length=2,max_length=100)

    email: EmailStr

    password: str = Field(min_length=8,max_length=128)


class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(min_length=1,max_length=128)


class UserResponse(BaseModel):

    id: uuid.UUID
    name: str
    email: EmailStr
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"

    user: UserResponse

# Force Pydantic to build the models immediately to prevent forward reference errors
UserResponse.model_rebuild()
TokenResponse.model_rebuild()