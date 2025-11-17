from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.Book])
def get_books(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    status: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Book)
    
    if category:
        query = query.filter(models.Book.category == category)
    
    if status:
        query = query.filter(models.Book.status == status)
    
    if search:
        query = query.filter(
            (models.Book.title.ilike(f"%{search}%")) |
            (models.Book.author.ilike(f"%{search}%")) |
            (models.Book.isbn.ilike(f"%{search}%"))
        )
    
    books = query.offset(skip).limit(limit).all()
    return books

@router.get("/{book_id}", response_model=schemas.Book)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("/", response_model=schemas.Book, status_code=status.HTTP_201_CREATED)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if ISBN already exists
    db_book = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if db_book:
        raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.put("/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    book: schemas.BookUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = book.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book

@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted successfully"}

@router.get("/stats/summary")
def get_books_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_books = db.query(models.Book).count()
    available = db.query(models.Book).filter(models.Book.status == models.BookStatus.AVAILABLE).count()
    borrowed = db.query(models.Book).filter(models.Book.status == models.BookStatus.BORROWED).count()
    reserved = db.query(models.Book).filter(models.Book.status == models.BookStatus.RESERVED).count()
    
    return {
        "total_books": total_books,
        "available": available,
        "borrowed": borrowed,
        "reserved": reserved
    }