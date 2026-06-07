from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.post("/borrow")
def borrow_book(
    request: schemas.BorrowBookRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if book exists and is available
    book = db.query(models.Book).filter(models.Book.id == request.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    active_count = db.query(models.Transaction).filter(
        models.Transaction.book_id == book.id,
        models.Transaction.transaction_type == models.TransactionType.BORROW,
        models.Transaction.return_date == None
    ).count()
    if active_count >= book.copies:
        raise HTTPException(status_code=400, detail="Book is not available")
    
    # Check if member exists
    member = db.query(models.Member).filter(models.Member.id == request.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if member.status != models.MemberStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Member is not active")
    
    # Create transaction
    due_date = datetime.now(timezone.utc) + timedelta(days=request.due_days)
    transaction = models.Transaction(
        book_id=request.book_id,
        member_id=request.member_id,
        transaction_type=models.TransactionType.BORROW,
        due_date=due_date
    )
    db.add(transaction)
    
    if active_count + 1 >= book.copies:
        book.status = models.BookStatus.BORROWED
    
    # Update member books count
    member.books_count += 1
    
    db.commit()
    db.refresh(transaction)
    
    return {
        "message": "Book borrowed successfully",
        "transaction_id": transaction.id,
        "due_date": due_date.isoformat()
    }

@router.post("/borrow-batch")
def borrow_books_batch(
    request: schemas.BorrowBatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not request.book_ids:
        raise HTTPException(status_code=400, detail="Pilih minimal satu buku")

    member = db.query(models.Member).filter(models.Member.id == request.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")
    if member.status != models.MemberStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Member tidak aktif")

    due_date = datetime.now(timezone.utc) + timedelta(days=request.due_days)
    borrowed = []

    for book_id in request.book_ids:
        book = db.query(models.Book).filter(models.Book.id == book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
        active_count = db.query(models.Transaction).filter(
            models.Transaction.book_id == book_id,
            models.Transaction.transaction_type == models.TransactionType.BORROW,
            models.Transaction.return_date == None
        ).count()
        if active_count >= book.copies:
            raise HTTPException(status_code=400, detail=f"Buku '{book.title}' tidak tersedia")

        transaction = models.Transaction(
            book_id=book_id,
            member_id=request.member_id,
            transaction_type=models.TransactionType.BORROW,
            due_date=due_date,
        )
        db.add(transaction)
        if active_count + 1 >= book.copies:
            book.status = models.BookStatus.BORROWED
        borrowed.append({"book_id": book_id, "title": book.title})

    member.books_count += len(request.book_ids)
    db.commit()

    return {
        "message": f"Berhasil meminjam {len(borrowed)} buku",
        "member_id": request.member_id,
        "due_date": due_date.isoformat(),
        "borrowed": borrowed,
    }

@router.post("/return")
def return_book(
    request: schemas.ReturnBookRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if book exists
    book = db.query(models.Book).filter(models.Book.id == request.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if member exists
    member = db.query(models.Member).filter(models.Member.id == request.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Find the borrow transaction
    borrow_transaction = db.query(models.Transaction).filter(
        models.Transaction.book_id == request.book_id,
        models.Transaction.member_id == request.member_id,
        models.Transaction.transaction_type == models.TransactionType.BORROW,
        models.Transaction.return_date == None
    ).first()
    
    if not borrow_transaction:
        raise HTTPException(status_code=400, detail="No active borrow record found")
    
    # Create return transaction
    return_transaction = models.Transaction(
        book_id=request.book_id,
        member_id=request.member_id,
        transaction_type=models.TransactionType.RETURN
    )
    db.add(return_transaction)
    
    # Update borrow transaction with return date
    borrow_transaction.return_date = datetime.now(timezone.utc)
    
    remaining = db.query(models.Transaction).filter(
        models.Transaction.book_id == book.id,
        models.Transaction.transaction_type == models.TransactionType.BORROW,
        models.Transaction.return_date == None,
        models.Transaction.id != borrow_transaction.id
    ).count()
    book.status = models.BookStatus.AVAILABLE if remaining == 0 else models.BookStatus.BORROWED
    
    # Update member books count
    if member.books_count > 0:
        member.books_count -= 1
    
    db.commit()
    db.refresh(return_transaction)
    
    # Check if returned late
    is_late = datetime.utcnow() > borrow_transaction.due_date if borrow_transaction.due_date else False

    if is_late and borrow_transaction.due_date:
        existing_fine = db.query(models.Fine).filter(
            models.Fine.transaction_id == borrow_transaction.id,
            models.Fine.fine_type == models.FineType.LATE
        ).first()
        if not existing_fine:
            setting = db.query(models.Setting).filter_by(key="late_fee_rate").first()
            rate = float(setting.value) if setting else 1000.0
            days_late = max(1, (datetime.utcnow() - borrow_transaction.due_date).days)
            db.add(models.Fine(
                member_id=member.id,
                book_id=book.id,
                transaction_id=borrow_transaction.id,
                fine_type=models.FineType.LATE,
                amount=days_late * rate,
                reason=f"Terlambat {days_late} hari",
            ))
            db.commit()

    return {
        "message": "Book returned successfully",
        "transaction_id": return_transaction.id,
        "is_late": is_late,
        "return_date": return_transaction.transaction_date.isoformat()
    }

@router.get("/", response_model=List[schemas.Transaction])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    book_id: int = None,
    member_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Transaction)
    
    if book_id:
        query = query.filter(models.Transaction.book_id == book_id)
    
    if member_id:
        query = query.filter(models.Transaction.member_id == member_id)
    
    transactions = query.order_by(models.Transaction.transaction_date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.get("/active-borrows")
def get_active_borrows(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from sqlalchemy.orm import joinedload
    
    # Get all borrow transactions without a return date, with joined book and member data
    active_borrows = db.query(models.Transaction).options(
        joinedload(models.Transaction.book),
        joinedload(models.Transaction.member)
    ).filter(
        models.Transaction.transaction_type == models.TransactionType.BORROW,
        models.Transaction.return_date == None
    ).all()
    
    result = []
    for transaction in active_borrows:
        is_overdue = datetime.utcnow() > transaction.due_date if transaction.due_date else False
        
        result.append({
            "transaction_id": transaction.id,
            "book_id": transaction.book_id,
            "book_title": transaction.book.title if transaction.book else "Unknown",
            "member_id": transaction.member_id,
            "member_name": transaction.member.name if transaction.member else "Unknown",
            "borrow_date": transaction.transaction_date.isoformat(),
            "due_date": transaction.due_date.isoformat() if transaction.due_date else None,
            "is_overdue": is_overdue
        })
    
    return result