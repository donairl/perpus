from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

DEFAULTS = {
    "late_fee_rate": ("1000", "Denda per hari keterlambatan (Rp)"),
}

def _ensure_defaults(db: Session):
    for key, (value, label) in DEFAULTS.items():
        if not db.query(models.Setting).filter_by(key=key).first():
            db.add(models.Setting(key=key, value=value, label=label))
    db.commit()

@router.get("/", response_model=list[schemas.SettingResponse])
def get_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    _ensure_defaults(db)
    return db.query(models.Setting).all()

@router.put("/{key}", response_model=schemas.SettingResponse)
def update_setting(
    key: str,
    data: schemas.SettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    setting = db.query(models.Setting).filter_by(key=key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting tidak ditemukan")
    setting.value = data.value
    db.commit()
    db.refresh(setting)
    return setting
