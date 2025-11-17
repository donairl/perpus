from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models import BookStatus, MembershipType, MemberStatus, TransactionType

# Book schemas
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    status: BookStatus = BookStatus.AVAILABLE
    copies: int = 1

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category: Optional[str] = None
    status: Optional[BookStatus] = None
    copies: Optional[int] = None

class Book(BookBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Member schemas
class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    membership_type: MembershipType = MembershipType.BASIC
    status: MemberStatus = MemberStatus.ACTIVE

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    membership_type: Optional[MembershipType] = None
    status: Optional[MemberStatus] = None
    books_count: Optional[int] = None

class Member(MemberBase):
    id: int
    books_count: int
    join_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True

# Transaction schemas
class BorrowBookRequest(BaseModel):
    book_id: int
    member_id: int
    due_days: int = 14  # Default 14 days

class ReturnBookRequest(BaseModel):
    book_id: int
    member_id: int

class Transaction(BaseModel):
    id: int
    book_id: int
    member_id: int
    transaction_type: TransactionType
    transaction_date: datetime
    due_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True