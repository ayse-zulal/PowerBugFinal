from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ConversationCreate(BaseModel):
    user_id: int
    title: Optional[str] = None

class MessageInput(BaseModel):
    message: str

class MessageOutput(BaseModel):
    student_message: str
