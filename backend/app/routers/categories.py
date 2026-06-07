from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Category).order_by(models.Category.name).all()

@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if db.query(models.Category).filter_by(name=data.name).first():
        raise HTTPException(status_code=400, detail="Kategori sudah ada")
    cat = models.Category(name=data.name, description=data.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    cat = db.query(models.Category).filter_by(id=category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    cat.name = data.name
    cat.description = data.description
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    cat = db.query(models.Category).filter_by(id=category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    if db.query(models.Book).filter_by(category_id=category_id).first():
        raise HTTPException(status_code=400, detail="Kategori masih digunakan oleh buku")
    db.delete(cat)
    db.commit()
    return {"message": "Kategori dihapus"}
