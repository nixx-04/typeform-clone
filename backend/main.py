import sys
import os
# Add root path to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.database.connection import get_db, Base, engine
from backend.schemas import (
    FormCreate, FormResponse, FormUpdate,
    QuestionCreate, QuestionResponse, QuestionUpdate,
    ResponseCreate, ResponseResponse
)
from backend.crud import (
    form as form_crud,
    question as question_crud,
    response as response_crud
)

app = FastAPI(
    title="Typeform API (SQLite + SQLAlchemy)",
    description="Full-featured relational backend for form builder and survey respondent system.",
    version="1.0.0"
)

# Startup event to ensure database tables exist (sqlite)
@app.on_event("startup")
def startup_event():
    # In SQLite, we can create the tables automatically on startup for ease of demo
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Typeform SQLite Backend!",
        "docs": "/docs",
        "status": "healthy"
    }

# --- FORMS ENDPOINTS ---

@app.post("/api/forms", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(form: FormCreate, db: Session = Depends(get_db)):
    return form_crud.create_form(db=db, form=form)

@app.get("/api/forms", response_model=List[FormResponse])
def read_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return form_crud.get_forms(db=db, skip=skip, limit=limit)

@app.get("/api/forms/{form_id}", response_model=FormResponse)
def read_form(form_id: str, db: Session = Depends(get_db)):
    db_form = form_crud.get_form(db=db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.put("/api/forms/{form_id}", response_model=FormResponse)
def update_form(form_id: str, updates: FormUpdate, db: Session = Depends(get_db)):
    db_form = form_crud.update_form(db=db, form_id=form_id, updates=updates)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.delete("/api/forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    success = form_crud.delete_form(db=db, form_id=form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return None


# --- QUESTIONS ENDPOINTS ---

@app.post("/api/forms/{form_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question_for_form(form_id: str, question: QuestionCreate, db: Session = Depends(get_db)):
    # Verify form exists first
    db_form = form_crud.get_form(db=db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return question_crud.create_question(db=db, form_id=form_id, question=question)

@app.get("/api/forms/{form_id}/questions", response_model=List[QuestionResponse])
def read_form_questions(form_id: str, db: Session = Depends(get_db)):
    db_form = form_crud.get_form(db=db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return question_crud.get_form_questions(db=db, form_id=form_id)

@app.put("/api/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: str, updates: QuestionUpdate, db: Session = Depends(get_db)):
    db_question = question_crud.update_question(db=db, question_id=question_id, updates=updates)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.delete("/api/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    success = question_crud.delete_question(db=db, question_id=question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return None

@app.post("/api/forms/{form_id}/reorder", response_model=List[QuestionResponse])
def reorder_questions(form_id: str, ordered_ids: List[str], db: Session = Depends(get_db)):
    db_form = form_crud.get_form(db=db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return question_crud.reorder_questions(db=db, form_id=form_id, ordered_ids=ordered_ids)


# --- RESPONSES & ANALYTICS ENDPOINTS ---

@app.post("/api/forms/{form_id}/responses", response_model=ResponseResponse, status_code=status.HTTP_201_CREATED)
def submit_response(form_id: str, response_data: ResponseCreate, db: Session = Depends(get_db)):
    if form_id != response_data.form_id:
        raise HTTPException(status_code=400, detail="Form ID path parameter and body form_id must match")
    
    db_form = form_crud.get_form(db=db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    return response_crud.create_response_with_answers(db=db, response_in=response_data)

@app.get("/api/forms/{form_id}/responses", response_model=List[ResponseResponse])
def read_form_responses(form_id: str, db: Session = Depends(get_db)):
    db_form = form_crud.get_form(db=db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return response_crud.get_form_responses(db=db, form_id=form_id)

@app.get("/api/forms/{form_id}/analytics")
def read_form_analytics(form_id: str, db: Session = Depends(get_db)):
    analytics = response_crud.get_response_analytics(db=db, form_id=form_id)
    if not analytics:
        raise HTTPException(status_code=404, detail="Form not found")
    return analytics
