from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Dict
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


class CreationBase(BaseModel):
    user_id: int
    skill: str
    timeframe: str
    base_knowledge: str
    target_level: str
    content: Dict

class CreationResponse(CreationBase):
    rid: int
    created_at: datetime

    class Config:
        orm_mode = True

class GraphNodesBase(BaseModel):
    rid: int
    nodes: Dict
    edges: Dict
    node_desc: Dict
    markednodes: List[int] = []
    completed: bool
    completed_at: Optional[datetime] = None

class GraphNodesResponse(GraphNodesBase):
    cid: int

    class Config:
        orm_mode = True
