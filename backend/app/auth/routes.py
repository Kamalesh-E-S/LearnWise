from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Form, Request # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm # type: ignore
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, TokenData
from app.auth.security import get_password_hash, verify_password, create_access_token
from datetime import datetime, timedelta
from jose import JWTError, jwt # type: ignore
from app.models import Creation, GraphNodes
from app.schemas import CreationBase, CreationResponse, GraphNodesResponse

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Get user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Authenticate user
def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

# Signup route
@router.post("/signup")
async def signup(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # Log request data for debugging
        form_data = await request.form()
        print("Received form data:", form_data)
        
        # Validate input using Pydantic model
        user_data = UserCreate(email=email, password=password)
        
        # Check for existing user
        existing_user = get_user_by_email(db, user_data.email)
        if existing_user:
            return JSONResponse(
                status_code=400,
                content={"detail": "Email already registered"}
            )

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            created_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Return user data
        return jsonable_encoder(UserResponse(
            id=new_user.id,
            email=new_user.email,
            created_at=new_user.created_at
        ))
        
    except ValidationError as e:
        print("Validation error:", str(e))
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": e.errors()}
        )
    except Exception as e:
        print("Unexpected error:", str(e))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred"}
        )

# Login route
@router.post("/login")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        # Log request data for debugging
        print("Login attempt for username:", form_data.username)
        
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "detail": "Incorrect email or password"
                },
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()

        # Create access token
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=1440)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except ValidationError as e:
        print("Validation error:", str(e))
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": e.errors()}
        )
    except Exception as e:
        print("Unexpected error:", str(e))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred"}
        )
    
# Get current user
@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            token,
            "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
            algorithms=["HS256"]
        )
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

@router.get("/ongoing", response_model=List[GraphNodesResponse])
async def get_ongoing_roadmaps(db: Session = Depends(get_db)):
    return db.query(GraphNodes).filter(GraphNodes.completed == False).all()

@router.get("/completed", response_model=List[GraphNodesResponse])
async def get_completed_roadmaps(db: Session = Depends(get_db)):
    return db.query(GraphNodes).filter(GraphNodes.completed == True).all()

@router.post("/create-roadmap", response_model=CreationResponse)
async def create_roadmap(roadmap: CreationBase, db: Session = Depends(get_db)):
    new_roadmap = Creation(**roadmap.dict(), created_at=datetime.utcnow())
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap