import enum
from sqlalchemy import Column, String, Enum, Boolean, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.models.base import BaseModel

class QuestionType(str, enum.Enum):
    short_text = "short_text"
    long_text = "long_text"
    multiple_choice = "multiple_choice"
    dropdown = "dropdown"
    email = "email"
    number = "number"
    yes_no = "yes_no"
    rating = "rating"

class Question(BaseModel):
    __tablename__ = "questions"

    form_id = Column(
        String(36), 
        ForeignKey("forms.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    type = Column(Enum(QuestionType), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(String(1000), nullable=True)
    is_required = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, nullable=False, index=True)
    options = Column(JSON, nullable=True)  # Will store list of choices as JSON list

    # Relationships
    form = relationship("Form", back_populates="questions")
    answers = relationship(
        "Answer", 
        back_populates="question", 
        cascade="all, delete-orphan"
    )
