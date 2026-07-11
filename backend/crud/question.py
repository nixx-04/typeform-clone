from sqlalchemy.orm import Session
from typing import List
from backend.models.question import Question
from backend.schemas.question import QuestionCreate, QuestionUpdate

def get_question(db: Session, question_id: str):
    return db.query(Question).filter(Question.id == question_id).first()

def get_form_questions(db: Session, form_id: str):
    return db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()

def create_question(db: Session, form_id: str, question: QuestionCreate):
    db_question = Question(
        form_id=form_id,
        title=question.title,
        type=question.type,
        description=question.description,
        is_required=question.is_required,
        order_index=question.order_index,
        options=question.options
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, question_id: str, updates: QuestionUpdate):
    db_question = get_question(db, question_id)
    if not db_question:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_question, key, value)
        
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: str):
    db_question = get_question(db, question_id)
    if not db_question:
        return False
    
    form_id = db_question.form_id
    order_index = db_question.order_index
    
    db.delete(db_question)
    
    # Shift orders of remaining questions
    remaining = db.query(Question).filter(Question.form_id == form_id, Question.order_index > order_index).all()
    for q in remaining:
        q.order_index -= 1
        
    db.commit()
    return True

def reorder_questions(db: Session, form_id: str, ordered_ids: List[str]):
    """Optimized for drag-and-drop question ordering.
    Updates order_index for a list of question IDs in the specified order.
    """
    for index, q_id in enumerate(ordered_ids):
        db.query(Question).filter(Question.id == q_id, Question.form_id == form_id).update(
            {"order_index": index}
        )
    db.commit()
    return get_form_questions(db, form_id)
