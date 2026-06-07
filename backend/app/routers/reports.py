from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.database import get_db
from app import models, auth

router = APIRouter()

@router.get("/top-books")
def get_top_books(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = (
        db.query(
            models.Book.id,
            models.Book.title,
            models.Book.author,
            models.Book.category,
            func.count(models.Transaction.id).label("borrow_count")
        )
        .join(models.Transaction, models.Transaction.book_id == models.Book.id)
        .filter(models.Transaction.transaction_type == models.TransactionType.BORROW)
    )
    if start_date:
        query = query.filter(
            models.Transaction.transaction_date >= datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        )
    if end_date:
        end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc) + timedelta(days=1)
        query = query.filter(models.Transaction.transaction_date < end_dt)
    rows = (
        query
        .group_by(models.Book.id, models.Book.title, models.Book.author, models.Book.category)
        .order_by(func.count(models.Transaction.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "book_id": r.id,
            "title": r.title,
            "author": r.author,
            "category": r.category,
            "borrow_count": r.borrow_count,
        }
        for r in rows
    ]

@router.get("/top-members")
def get_top_members(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = (
        db.query(
            models.Member.id,
            models.Member.name,
            models.Member.email,
            models.Member.membership_type,
            func.count(models.Transaction.id).label("borrow_count")
        )
        .join(models.Transaction, models.Transaction.member_id == models.Member.id)
        .filter(models.Transaction.transaction_type == models.TransactionType.BORROW)
    )
    if start_date:
        query = query.filter(
            models.Transaction.transaction_date >= datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        )
    if end_date:
        end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc) + timedelta(days=1)
        query = query.filter(models.Transaction.transaction_date < end_dt)
    rows = (
        query
        .group_by(models.Member.id, models.Member.name, models.Member.email, models.Member.membership_type)
        .order_by(func.count(models.Transaction.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "member_id": r.id,
            "name": r.name,
            "email": r.email,
            "membership_type": r.membership_type,
            "borrow_count": r.borrow_count,
        }
        for r in rows
    ]

@router.get("/overdue")
def get_overdue_borrows(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    now = datetime.utcnow()
    overdue = (
        db.query(models.Transaction)
        .options(
            joinedload(models.Transaction.book),
            joinedload(models.Transaction.member)
        )
        .filter(
            models.Transaction.transaction_type == models.TransactionType.BORROW,
            models.Transaction.return_date == None,
            models.Transaction.due_date < now
        )
        .order_by(models.Transaction.due_date.asc())
        .all()
    )
    return [
        {
            "transaction_id": t.id,
            "member_id": t.member_id,
            "member_name": t.member.name if t.member else "Unknown",
            "member_email": t.member.email if t.member else "",
            "member_phone": t.member.phone if t.member else "",
            "membership_type": str(t.member.membership_type) if t.member else "",
            "book_id": t.book_id,
            "book_title": t.book.title if t.book else "Unknown",
            "book_author": t.book.author if t.book else "",
            "borrow_date": t.transaction_date.isoformat(),
            "due_date": t.due_date.isoformat(),
            "days_overdue": (now - t.due_date).days,
        }
        for t in overdue
    ]
