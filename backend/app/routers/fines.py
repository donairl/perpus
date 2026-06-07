from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime
from typing import Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

DEFAULT_LATE_FEE_RATE = 1000.0

def get_late_fee_rate(db: Session) -> float:
    setting = db.query(models.Setting).filter_by(key="late_fee_rate").first()
    try:
        return float(setting.value) if setting else DEFAULT_LATE_FEE_RATE
    except (ValueError, AttributeError):
        return DEFAULT_LATE_FEE_RATE

def _fine_to_dict(f: models.Fine) -> dict:
    return {
        "id": f.id,
        "member_id": f.member_id,
        "book_id": f.book_id,
        "transaction_id": f.transaction_id,
        "fine_type": f.fine_type,
        "amount": f.amount,
        "status": f.status,
        "reason": f.reason,
        "paid_at": f.paid_at.isoformat() if f.paid_at else None,
        "created_at": f.created_at.isoformat(),
        "member_name": f.member.name if f.member else "Unknown",
        "book_title": f.book.title if f.book else None,
    }

@router.get("/summary")
def get_fine_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    unpaid = db.query(func.count(models.Fine.id), func.sum(models.Fine.amount)).filter(
        models.Fine.status == models.FineStatus.UNPAID
    ).first()
    paid = db.query(func.count(models.Fine.id), func.sum(models.Fine.amount)).filter(
        models.Fine.status == models.FineStatus.PAID
    ).first()
    return {
        "total_unpaid": unpaid[0] or 0,
        "amount_unpaid": float(unpaid[1] or 0),
        "total_paid": paid[0] or 0,
        "amount_paid": float(paid[1] or 0),
    }

@router.get("/")
def get_fines(
    status: Optional[str] = Query(None),
    member_id: Optional[int] = Query(None),
    fine_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Fine).options(
        joinedload(models.Fine.member),
        joinedload(models.Fine.book),
    )
    if status:
        query = query.filter(models.Fine.status == status)
    if member_id:
        query = query.filter(models.Fine.member_id == member_id)
    if fine_type:
        query = query.filter(models.Fine.fine_type == fine_type)
    return [_fine_to_dict(f) for f in query.order_by(models.Fine.created_at.desc()).all()]

@router.post("/")
def create_fine(
    data: schemas.FineCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not db.query(models.Member).filter_by(id=data.member_id).first():
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")
    fine = models.Fine(
        member_id=data.member_id,
        book_id=data.book_id,
        fine_type=data.fine_type,
        amount=data.amount,
        reason=data.reason,
    )
    db.add(fine)
    db.commit()
    db.refresh(fine)
    return {"id": fine.id, "message": "Denda berhasil dibuat"}

@router.put("/{fine_id}/pay")
def pay_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    fine = db.query(models.Fine).filter_by(id=fine_id).first()
    if not fine:
        raise HTTPException(status_code=404, detail="Denda tidak ditemukan")
    if fine.status == models.FineStatus.PAID:
        raise HTTPException(status_code=400, detail="Denda sudah lunas")
    fine.status = models.FineStatus.PAID
    fine.paid_at = datetime.utcnow()
    db.commit()
    return {"id": fine.id, "message": "Denda berhasil dilunasi", "paid_at": fine.paid_at.isoformat()}
