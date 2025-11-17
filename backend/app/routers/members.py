from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.Member])
def get_members(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Member)
    
    if status:
        query = query.filter(models.Member.status == status)
    
    if search:
        query = query.filter(
            (models.Member.name.ilike(f"%{search}%")) |
            (models.Member.email.ilike(f"%{search}%"))
        )
    
    members = query.offset(skip).limit(limit).all()
    return members

@router.get("/{member_id}", response_model=schemas.Member)
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("/", response_model=schemas.Member)
def create_member(
    member: schemas.MemberCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if email already exists
    db_member = db.query(models.Member).filter(models.Member.email == member.email).first()
    if db_member:
        raise HTTPException(status_code=400, detail="Member with this email already exists")
    
    db_member = models.Member(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.put("/{member_id}", response_model=schemas.Member)
def update_member(
    member_id: int,
    member: schemas.MemberUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    update_data = member.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(db_member)
    db.commit()
    return {"message": "Member deleted successfully"}

@router.get("/stats/summary")
def get_members_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_members = db.query(models.Member).count()
    active = db.query(models.Member).filter(models.Member.status == models.MemberStatus.ACTIVE).count()
    expired = db.query(models.Member).filter(models.Member.status == models.MemberStatus.EXPIRED).count()
    
    return {
        "total_members": total_members,
        "active": active,
        "expired": expired
    }