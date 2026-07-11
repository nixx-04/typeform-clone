from sqlalchemy.orm import Session
from backend.models.form import Form, FormStatus
from backend.schemas.form import FormCreate, FormUpdate

def get_form(db: Session, form_id: str):
    return db.query(Form).filter(Form.id == form_id).first()

def get_forms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Form).offset(skip).limit(limit).all()

def create_form(db: Session, form: FormCreate):
    db_form = Form(title=form.title, status=form.status)
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

def update_form(db: Session, form_id: str, updates: FormUpdate):
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_form, key, value)
        
    db.commit()
    db.refresh(db_form)
    return db_form

def delete_form(db: Session, form_id: str):
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True
